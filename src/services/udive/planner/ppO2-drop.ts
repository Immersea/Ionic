import { DiveToolsService } from "./dive-tools";

export class ppO2Drop {
  /**
        Fm=metabolizzato in superficie circa 0,8 l / 20 l min
        Fr ossigeno in bombola %
        Mv consumo al minuto in superficie 
        P pressione
        Fn ossigeno dopo n respiri

        gas fresco 
        0,1*P*Mv + 0,9*(Fm/P)*P*Mv
        Gas espirato
        0,9*P*Mv*(Fn-1 - Fm/P)

        Fn = ((0,1*P*Mv + 0,9*(Fm/P)*P*Mv)*Fr + 0,9*P*Mv*(Fn-1 - Fm/P)) / P*Mv

        F = Fr - 9*(Fm/P)*(1-Fr)

     */
  mv: number = 20;
  fm: number = 0.8;

  constructor(cons: number, met: number) {
    this.mv = DiveToolsService.convertInlt(cons);
    this.fm = DiveToolsService.convertInlt(met) / this.mv; // 0,8 l / 20 l/min
  }

  getMv() {
    return this.mv;
  }

  setMv(mv) {
    this.mv = DiveToolsService.convertInlt(mv);
  }

  getFm() {
    return this.fm;
  }

  setFm(fm) {
    this.fm = DiveToolsService.convertInlt(fm) / this.mv;
  }

  F(depth, fr) {
    // F = Fr - 9*(Fm/P)*(1-Fr)
    let f = 0.0;
    let p = DiveToolsService.depth2press(depth);
    f = fr / 100 - 9 * (this.fm / p) * (1 - fr / 100);

    return f;
  }

  PF(depth, fr) {
    // F = Fr - 9*(Fm/P)*(1-Fr)
    let pf;
    let p = DiveToolsService.depth2press(depth);
    pf = (p * fr) / 100 - 9 * this.fm * (1 - fr / 100);
    return pf;
  }

  PFd(depth, fr) {
    // F = Fr - 9*(Fm/P)*(1-Fr)
    let pfd = new Array();
    for (let i = 1; i <= depth; i++) {
      let p = DiveToolsService.depth2press(i);
      pfd[i] = (p * fr) / 100 - 9 * this.fm * (1 - fr / 100);
    }

    return pfd;
  }

  hypoxicDepth(fr) {
    // F = Fr - 9*(Fm/P)*(1-Fr)
    let depth = 1000;
    for (let i = 1; i <= depth; i++) {
      let p = DiveToolsService.depth2press(i);
      let pO2 = (p * fr) / 100 - 9 * this.fm * (1 - fr / 100);
      if (pO2 >= 0.15) return i;
    }
    return 0;
  }

  Fn(depth, time, fr) {
    //Fn = ((0,1*P*Mv + 0,9*(Fm/P)*P*Mv)*Fr + 0,9*P*Mv*(Fn-1 - Fm/P)*P*Mv) / P*Mv
    let fn = new Array();
    let p = DiveToolsService.depth2press(depth);
    if (time <= 1) {
      time = 1;
    } else {
      time = Math.round(time);
    }
    fn[0] = 1.0;
    for (let i = 1; i < time; i++) {
      fn[i] =
        ((0.1 + 0.9 * (this.fm / p)) * fr) / 100 +
        0.9 * (fn[i - 1] - this.fm / p);
    }

    return fn;
  }

  PFn(depth, time, fr) {
    //Fn = ((0,1*P*Mv + 0,9*(Fm/P)*P*Mv)*Fr + 0,9*P*Mv*(Fn-1 - Fm/P)*P*Mv) / P*Mv
    let pfn = new Array();
    let p = DiveToolsService.depth2press(depth);
    if (time <= 1) {
      time = 1;
    } else {
      time = Math.round(time);
    }
    pfn[0] = (fr / 100) * p;
    for (let i = 1; i < time; i++) {
      pfn[i] =
        ((0.1 * p + 0.9 * this.fm) * fr) / 100 + 0.9 * (pfn[i - 1] - this.fm);
    }
    return pfn;
  }

  PFavg(depth, time, fr) {
    //Average pO2 in the time frame at depth
    let pfn = new Array();
    let p = DiveToolsService.depth2press(depth);
    let pfavg = 0;
    pfn[0] = (fr / 100) * p;
    pfavg += pfn[0];
    if (time <= 1) {
      time = 1;
    } else {
      time = Math.round(time);
    }
    for (let i = 1; i < time; i++) {
      pfn[i] =
        ((0.1 * p + 0.9 * this.fm) * fr) / 100 + 0.9 * (pfn[i - 1] - this.fm);
      pfavg += pfn[i];
    }
    return pfavg / time;
  }
}
