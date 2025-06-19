// SPDX-License-Identifier: GPL-2.0
#ifdef __clang__
// Clang has a bug on zero-initialization of C structs.
#pragma clang diagnostic ignored "-Wmissing-field-initializers"
#endif

#include "dive.h"
#include "parse.h"
#include "sample.h"
#include "subsurface-string.h"
#include "divelist.h"
#include "divelog.h"
#include "device.h"
#include "errorhelper.h"
#include "membuffer.h"
#include "gettext.h"
#include "tag.h"

#include <stdlib.h>

#ifdef __EMSCRIPTEN__
// Stub sqlite3 types and functions for WebAssembly build
typedef struct sqlite3 sqlite3;
typedef struct sqlite3_stmt sqlite3_stmt;
#define SQLITE_OK    0
#define SQLITE_ERROR 1
#define SQLITE_ROW   100

static inline int sqlite3_exec(sqlite3 *handle, const char *sql,
    int (*callback)(void*,int,char**,char**), void *arg, char **errmsg) {
    return SQLITE_OK;
}
static inline int sqlite3_prepare_v2(sqlite3 *handle, const char *sql,
    int nByte, sqlite3_stmt **ppStmt, const char **pzTail) {
    return SQLITE_OK;
}
static inline int sqlite3_bind_int(sqlite3_stmt *stmt, int idx, int value) {
    return SQLITE_OK;
}
static inline int sqlite3_step(sqlite3_stmt *stmt) {
    return SQLITE_ROW;
}
static inline int sqlite3_column_int(sqlite3_stmt *stmt, int col) {
    return 0;
}
static inline const unsigned char* sqlite3_column_text(sqlite3_stmt *stmt, int col) {
    return (const unsigned char*)"";
}
static inline int sqlite3_finalize(sqlite3_stmt *stmt) {
    return SQLITE_OK;
}
static inline void sqlite3_free(void *ptr) { }
#endif

static int dm4_events(void *param, int, char **data, char **)
{
	using namespace std::string_literals;
	struct parser_state *state = (struct parser_state *)param;

	event_start(state);
	if (data[1])
		state->cur_event.time.seconds = atoi(data[1]);

	if (data[2]) {
		switch (atoi(data[2])) {
		case 1:
			/* 1 Mandatory Safety Stop */
			state->cur_event.name = "safety stop (mandatory)"s;
			break;
		case 3:
			/* 3 Deco */
			/* What is Subsurface's term for going to
				 * deco? */
			state->cur_event.name = "deco"s;
			break;
		case 4:
			/* 4 Ascent warning */
			state->cur_event.name = "ascent"s;
			break;
		case 5:
			/* 5 Ceiling broken */
			state->cur_event.name = "violation"s;
			break;
		case 6:
			/* 6 Mandatory safety stop ceiling error */
			state->cur_event.name = "violation"s;
			break;
		case 7:
			/* 7 Below deco floor */
			state->cur_event.name = "below floor"s;
			break;
		case 8:
			/* 8 Dive time alarm */
			state->cur_event.name = "divetime"s;
			break;
		case 9:
			/* 9 Depth alarm */
			state->cur_event.name = "maxdepth"s;
			break;
		case 10:
		/* 10 OLF 80% */
		case 11:
			/* 11 OLF 100% */
			state->cur_event.name = "OLF"s;
			break;
		case 12:
			/* 12 High pO₂ */
			state->cur_event.name = "PO2"s;
			break;
		case 13:
			/* 13 Air time */
			state->cur_event.name = "airtime"s;
			break;
		case 17:
			/* 17 Ascent warning */
			state->cur_event.name = "ascent"s;
			break;
		case 18:
			/* 18 Ceiling error */
			state->cur_event.name = "ceiling"s;
			break;
		case 19:
			/* 19 Surfaced */
			state->cur_event.name = "surface"s;
			break;
		case 20:
			/* 20 Deco */
			state->cur_event.name = "deco"s;
			break;
		case 22:
		case 32:
			/* 22 Mandatory safety stop violation */
			/* 32 Deep stop violation */
			state->cur_event.name = "violation"s;
			break;
		case 30:
			/* Tissue level warning */
			state->cur_event.name = "tissue warning"s;
			break;
		case 37:
			/* Tank pressure alarm */
			state->cur_event.name = "tank pressure"s;
			break;
		case 257:
			/* 257 Dive active */
			/* This seems to be given after surface when
			 * descending again. */
			state->cur_event.name = "surface"s;
			break;
		case 258:
			/* 258 Bookmark */
			if (data[3]) {
				state->cur_event.name = "heading"s;
				state->cur_event.value = atoi(data[3]);
			} else {
				state->cur_event.name = "bookmark"s;
			}
			break;
		case 259:
			/* Deep stop */
			state->cur_event.name = "Deep stop"s;
			break;
		case 260:
			/* Deep stop */
			state->cur_event.name = "Deep stop cleared"s;
			break;
		case 266:
			/* Mandatory safety stop activated */
			state->cur_event.name = "safety stop (mandatory)"s;
			break;
		case 267:
			/* Mandatory safety stop deactivated */
			/* DM5 shows this only on event list, not on the
			 * profile so skipping as well for now */
			break;
		default:
			state->cur_event.name = "unknown"s;
			state->cur_event.value = atoi(data[2]);
			break;
		}
	}
	event_end(state);

	return 0;
}

static int dm4_tags(void *param, int, char **data, char **)
{
	struct parser_state *state = (struct parser_state *)param;

	if (data[0])
		taglist_add_tag(state->cur_dive->tags, data[0]);

	return 0;
}

static int dm4_dive(void *param, int, char **data, char **)
{
	int i;
	int interval, retval = 0;
	struct parser_state *state = (struct parser_state *)param;
	sqlite3 *handle = state->sql_handle;
	float *profileBlob;
	unsigned char *tempBlob;
	int *pressureBlob;
	char get_events_template[] = "select * from Mark where DiveId = %d";
	char get_tags_template[] = "select Text from DiveTag where DiveId = %d";
	char get_events[64];
	cylinder_t *cyl;

	dive_start(state);
	state->cur_dive->number = atoi(data[0]);

	state->cur_dive->when = (time_t)(atol(data[1]));
	if (data[2])
		utf8_string_std(data[2], &state->cur_dive->notes);

	/*
	 * DM4 stores Duration and DiveTime. It looks like DiveTime is
	 * 10 to 60 seconds shorter than Duration. However, I have no
	 * idea what is the difference and which one should be used.
	 * Duration = data[3]
	 * DiveTime = data[15]
	 */
	if (data[3])
		state->cur_dive->duration.seconds = atoi(data[3]);
	if (data[15])
		state->cur_dive->dcs[0].duration.seconds = atoi(data[15]);

	/*
	 * TODO: the deviceid hash should be calculated here.
	 */
	settings_start(state);
	dc_settings_start(state);
	if (data[4])
		utf8_string_std(data[4], &state->cur_settings.dc.serial_nr);
	if (data[5])
		utf8_string_std(data[5], &state->cur_settings.dc.model);

	state->cur_settings.dc.deviceid = 0xffffffff;
	dc_settings_end(state);
	settings_end(state);

	if (data[6])
		state->cur_dive->dcs[0].maxdepth.mm = lrint(permissive_strtod(data[6], NULL) * 1000);
	if (data[8])
		state->cur_dive->dcs[0].airtemp.mkelvin = C_to_mkelvin(atoi(data[8]));
	if (data[9])
		state->cur_dive->dcs[0].watertemp.mkelvin = C_to_mkelvin(atoi(data[9]));

	/*
	 * TODO: handle multiple cylinders
	 */
	cyl = cylinder_start(state);
	if (data[22] && atoi(data[22]) > 0)
		cyl->start.mbar = atoi(data[22]);
	else if (data[10] && atoi(data[10]) > 0)
		cyl->start.mbar = atoi(data[10]);
	if (data[23] && atoi(data[23]) > 0)
		cyl->end.mbar = (atoi(data[23]));
	if (data[11] && atoi(data[11]) > 0)
		cyl->end.mbar = (atoi(data[11]));
	if (data[12])
		cyl->type.size.mliter = lrint((permissive_strtod(data[12], NULL)) * 1000);
	if (data[13])
		cyl->type.workingpressure.mbar = (atoi(data[13]));
	if (data[20])
		cyl->gasmix.o2.permille = atoi(data[20]) * 10;
	if (data[21])
		cyl->gasmix.he.permille = atoi(data[21]) * 10;
	cylinder_end(state);

	if (data[14])
		state->cur_dive->dcs[0].surface_pressure.mbar = (atoi(data[14]) * 1000);

	interval = data[16] ? atoi(data[16]) : 0;
	profileBlob = (float *)data[17];
	tempBlob = (unsigned char *)data[18];
	pressureBlob = (int *)data[19];
	for (i = 0; interval && i * interval < state->cur_dive->duration.seconds; i++) {
		sample_start(state);
		state->cur_sample->time.seconds = i * interval;
		if (profileBlob)
			state->cur_sample->depth.mm = lrintf(profileBlob[i] * 1000.0f);
		else
			state->cur_sample->depth.mm = state->cur_dive->dcs[0].maxdepth.mm;

		if (data[18] && data[18][0])
			state->cur_sample->temperature.mkelvin = C_to_mkelvin(tempBlob[i]);
		if (data[19] && data[19][0])
			state->cur_sample->pressure[0].mbar = pressureBlob[i];
		sample_end(state);
	}

	snprintf(get_events, sizeof(get_events) - 1, get_events_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm4_events, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm4_events failed.");
		return 1;
	}

	snprintf(get_events, sizeof(get_events) - 1, get_tags_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm4_tags, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm4_tags failed.");
		return 1;
	}

	dive_end(state);

	return SQLITE_OK;
}

int parse_dm4_buffer(sqlite3 *handle, const char *url, const char *, int, struct divelog *log)
{
	int retval;
	char *err = NULL;
	struct parser_state state;

	state.log = log;
	state.sql_handle = handle;

	/* StartTime is converted from Suunto's nano seconds to standard
	 * time. We also need epoch, not seconds since year 1. */
	char get_dives[] = "select D.DiveId,StartTime/10000000-62135596800,Note,Duration,SourceSerialNumber,Source,MaxDepth,SampleInterval,StartTemperature,BottomTemperature,D.StartPressure,D.EndPressure,Size,CylinderWorkPressure,SurfacePressure,DiveTime,SampleInterval,ProfileBlob,TemperatureBlob,PressureBlob,Oxygen,Helium,MIX.StartPressure,MIX.EndPressure FROM Dive AS D JOIN DiveMixture AS MIX ON D.DiveId=MIX.DiveId";

	retval = sqlite3_exec(handle, get_dives, &dm4_dive, &state, &err);

	if (retval != SQLITE_OK) {
		report_info("Database query failed '%s': %s.", url, err);
		sqlite3_free(err);
		return 1;
	}

	return 0;
}

static int dm5_cylinders(void *param, int, char **data, char **)
{
	struct parser_state *state = (struct parser_state *)param;
	cylinder_t *cyl;

	cyl = cylinder_start(state);
	if (data[7] && atoi(data[7]) > 0 && atoi(data[7]) < 350000)
		cyl->start.mbar = atoi(data[7]);
	if (data[8] && atoi(data[8]) > 0 && atoi(data[8]) < 350000)
		cyl->end.mbar = (atoi(data[8]));
	if (data[6]) {
		/* DM5 shows tank size of 12 liters when the actual
		 * value is 0 (and using metric units). So we just use
		 * the same 12 liters when size is not available */
		if (permissive_strtod(data[6], NULL) == 0.0 && cyl->start.mbar)
			cyl->type.size = 12_l;
		else
			cyl->type.size.mliter = lrint((permissive_strtod(data[6], NULL)) * 1000);
	}
	if (data[2])
		cyl->gasmix.o2.permille = atoi(data[2]) * 10;
	if (data[3])
		cyl->gasmix.he.permille = atoi(data[3]) * 10;
	cylinder_end(state);
	return 0;
}

static int dm5_gaschange(void *param, int, char **data, char **)
{
	using namespace std::string_literals;
	struct parser_state *state = (struct parser_state *)param;

	event_start(state);
	if (data[0])
		state->cur_event.time.seconds = atoi(data[0]);
	if (data[1]) {
		state->cur_event.name = "gaschange"s;
		state->cur_event.value = lrint(permissive_strtod(data[1], NULL));
	}

	/* He part of the mix */
	if (data[2])
		state->cur_event.value += lrint(permissive_strtod(data[2], NULL)) << 16;
	event_end(state);

	return 0;
}

static int dm5_dive(void *param, int, char **data, char **)
{
	int i;
	int tempformat = 0;
	int interval, retval = 0, block_size;
	struct parser_state *state = (struct parser_state *)param;
	sqlite3 *handle = state->sql_handle;
	unsigned const char *sampleBlob;
	char get_events_template[] = "select * from Mark where DiveId = %d";
	char get_tags_template[] = "select Text from DiveTag where DiveId = %d";
	char get_cylinders_template[] = "select * from DiveMixture where DiveId = %d";
	char get_gaschange_template[] = "select GasChangeTime,Oxygen,Helium from DiveGasChange join DiveMixture on DiveGasChange.DiveMixtureId=DiveMixture.DiveMixtureId where DiveId = %d";
	char get_events[512];

	dive_start(state);
	state->cur_dive->number = atoi(data[0]);

	state->cur_dive->when = (time_t)(atol(data[1]));
	if (data[2])
		utf8_string_std(data[2], &state->cur_dive->notes);

	if (data[3])
		state->cur_dive->duration.seconds = atoi(data[3]);
	if (data[15])
		state->cur_dive->dcs[0].duration.seconds = atoi(data[15]);

	/*
	 * TODO: the deviceid hash should be calculated here.
	 */
	settings_start(state);
	dc_settings_start(state);
	if (data[4]) {
		utf8_string_std(data[4], &state->cur_settings.dc.serial_nr);
		state->cur_settings.dc.deviceid = atoi(data[4]);
	}
	if (data[5])
		utf8_string_std(data[5], &state->cur_settings.dc.model);

	dc_settings_end(state);
	settings_end(state);

	if (data[6])
		state->cur_dive->dcs[0].maxdepth.mm = lrint(permissive_strtod(data[6], NULL) * 1000);
	if (data[8])
		state->cur_dive->dcs[0].airtemp.mkelvin = C_to_mkelvin(atoi(data[8]));
	if (data[9])
		state->cur_dive->dcs[0].watertemp.mkelvin = C_to_mkelvin(atoi(data[9]));

	if (data[4]) {
		state->cur_dive->dcs[0].deviceid = atoi(data[4]);
	}
	if (data[5])
		utf8_string_std(data[5], &state->cur_dive->dcs[0].model);

	if (data[25]) {
		switch(atoi(data[25])) {
			case 1:
				state->cur_dive->dcs[0].divemode = OC;
				break;
			case 5:
				state->cur_dive->dcs[0].divemode = CCR;
				break;
			default:
				state->cur_dive->dcs[0].divemode = OC;
				break;
		}
	}

	snprintf(get_events, sizeof(get_events) - 1, get_cylinders_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm5_cylinders, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm5_cylinders failed.");
		return 1;
	}

	if (data[14])
		state->cur_dive->dcs[0].surface_pressure.mbar = (atoi(data[14]) / 100);

	interval = data[16] ? atoi(data[16]) : 0;

	/*
	 * sampleBlob[0]	version number, indicates the size of one sample
	 *
	 * Following ones describe single sample, bugs in interpretation of the binary blob are likely:
	 *
	 * sampleBlob[3]	depth
	 * sampleBlob[7-9]	pressure
	 * sampleBlob[11]	temperature - either full Celsius or float, might be different field for some version of DM
	 */

	sampleBlob = (unsigned const char *)data[24];

	if (sampleBlob) {
		switch (sampleBlob[0]) {
			case 1:
				// Log is converted from DM4 to DM5
				block_size = 16;
				break;
			case 2:
				block_size = 19;
				break;
			case 3:
				block_size = 23;
				break;
			case 4:
				// Temperature is stored in float
				tempformat = 1;
				block_size = 26;
				break;
			case 5:
				// Temperature is stored in float
				tempformat = 1;
				block_size = 30;
				break;
			default:
				block_size = 16;
				break;
		}
	}

	for (i = 0; interval && sampleBlob && i * interval < state->cur_dive->duration.seconds; i++) {
		float *depth = (float *)&sampleBlob[i * block_size + 3];
		int32_t pressure = (sampleBlob[i * block_size + 9] << 16) + (sampleBlob[i * block_size + 8] << 8) + sampleBlob[i * block_size + 7];

		sample_start(state);
		state->cur_sample->time.seconds = i * interval;
		state->cur_sample->depth.mm = lrintf(depth[0] * 1000.0f);

		if (tempformat == 1) {
			float *temp = (float *)&(sampleBlob[i * block_size + 11]);
			state->cur_sample->temperature.mkelvin = C_to_mkelvin(*temp);
		} else {
			if ((sampleBlob[i * block_size + 11]) != 0x7F) {
				state->cur_sample->temperature.mkelvin = C_to_mkelvin(sampleBlob[i * block_size + 11]);
			}
		}

		/*
		 * Limit cylinder pressures to somewhat sensible values
		 */
		if (pressure >= 0 && pressure < 350000)
			state->cur_sample->pressure[0].mbar = pressure;
		sample_end(state);
	}

	/*
	 * Log was converted from DM4, thus we need to parse the profile
	 * from DM4 format
	 */

	if (i == 0) {
		float *profileBlob;
		unsigned char *tempBlob;
		int *pressureBlob;

		profileBlob = (float *)data[17];
		tempBlob = (unsigned char *)data[18];
		pressureBlob = (int *)data[19];
		for (i = 0; interval && i * interval < state->cur_dive->duration.seconds; i++) {
			sample_start(state);
			state->cur_sample->time.seconds = i * interval;
			if (profileBlob)
				state->cur_sample->depth.mm = lrintf(profileBlob[i] * 1000.0f);
			else
				state->cur_sample->depth.mm = state->cur_dive->dcs[0].maxdepth.mm;

			if (data[18] && data[18][0])
				state->cur_sample->temperature.mkelvin = C_to_mkelvin(tempBlob[i]);
			if (data[19] && data[19][0])
				state->cur_sample->pressure[0].mbar = pressureBlob[i];
			sample_end(state);
		}
	}

	snprintf(get_events, sizeof(get_events) - 1, get_gaschange_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm5_gaschange, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm5_gaschange failed.");
		return 1;
	}

	snprintf(get_events, sizeof(get_events) - 1, get_events_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm4_events, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm4_events failed.");
		return 1;
	}

	snprintf(get_events, sizeof(get_events) - 1, get_tags_template, state->cur_dive->number);
	retval = sqlite3_exec(handle, get_events, &dm4_tags, state, NULL);
	if (retval != SQLITE_OK) {
		report_info("Database query dm4_tags failed.");
		return 1;
	}

	dive_end(state);

	return SQLITE_OK;
}

int parse_dm5_buffer(sqlite3 *handle, const char *url, const char *, int, struct divelog *log)
{
	int retval;
	char *err = NULL;
	struct parser_state state;

	state.log = log;
	state.sql_handle = handle;

	/* StartTime is converted from Suunto's nano seconds to standard
	 * time. We also need epoch, not seconds since year 1. */
	char get_dives[] = "select DiveId,StartTime/10000000-62135596800,Note,Duration,coalesce(SourceSerialNumber,SerialNumber),Source,MaxDepth,SampleInterval,StartTemperature,BottomTemperature,StartPressure,EndPressure,'','',SurfacePressure,DiveTime,SampleInterval,ProfileBlob,TemperatureBlob,PressureBlob,'','','','',SampleBlob,Mode FROM Dive where Deleted is null";

	retval = sqlite3_exec(handle, get_dives, &dm5_dive, &state, &err);

	if (retval != SQLITE_OK) {
		report_info("Database query failed '%s': %s.", url, err);
		sqlite3_free(err);
		return 1;
	}

	return 0;
}
