export class UsersTeams {
  usersTeams: UserTeams[];
  users: {
    [id: string]: string[]; //["owner", "editor", etc.]
  };
  constructor(data?) {
    this.usersTeams = [];
    if (data && data.usersTeams && data.usersTeams.length > 0) {
      data.usersTeams.forEach((team) => {
        this.usersTeams.push(new UserTeams(team));
      });
    }
    this.users = {};
    if (data && data.users) {
      Object.keys(data.users).forEach((key) => {
        this.users[key] = data.users[key];
      });
    }
  }
}

export class UserTeams {
  uid: string;
  email: string;
  teams: string[];
  constructor(data?) {
    this.uid = data && data.uid ? data.uid : null;
    this.email = data && data.email ? data.email : null;
    this.teams = data && data.teams && data.teams.length > 0 ? data.teams : [];
  }
}
