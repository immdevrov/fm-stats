import type { Player, Table } from "../types";

import {
  average,
  displayDate,
  formatWage,
  getColumn,
  printTable,
} from "../utils";
import { applyFilters } from "./_filter";
import { IRole, Role } from "./_role";

export class GoalKeeperProcessor {
  players: GoalKeeper[];
  constructor(players: Player[]) {
    const pl = players.filter(GoalKeeper.isRole);

    this.players = pl.map((p) => new GoalKeeper(p));
  }

  filter() {
    const table = this.players satisfies Table<IGoalKeeper>;
    const averageSavesHeld = average(getColumn(table, "savesHeldPercentage"));

    const filteredPlayers = applyFilters(this.players, {
      noInjuriesFilter: (g: GoalKeeper) => !g.injuries,
      goodShotStoppers: (g: GoalKeeper) =>
        g.goalsPrevented90 === "Good" || g.goalsPrevented90 === "OK",
      holdMostSaves: (g: GoalKeeper) => {
        if (!averageSavesHeld) {
          return true;
        }
        return g.savesHeldPercentage >= averageSavesHeld;
      },
    });
    return filteredPlayers;
  }

  print(goakeepers: GoalKeeper[]) {
    const display = goakeepers.map((g) => {
      const {
        uid,
        name,
        nat,
        goalsPrevented90,
        height,
        mistakes,
        savesHeldPercentage,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        goalsPrevented90,
        height,
        mistakes,
        savesHeldPercentage,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} goalkeepers to watch`);
    printTable(display);
  }
}

export interface IGoalKeeper extends IRole {
  height: number;
  goalsPrevented90: "Good" | "OK" | "Poor";
  mistakes: number;
  savesHeldPercentage: number;
}
export class GoalKeeper extends Role implements IGoalKeeper {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some((p) => p.type === "GK");
  }

  get height() {
    return this.player.Height;
  }

  get goalsPrevented90(): "Good" | "OK" | "Poor" {
    const gp = this.player.xGPPer90;
    if (gp >= 0.2) {
      return "Good";
    }
    if (gp < 0.2 && gp >= 0) {
      return "OK";
    }
    return "Poor";
  }

  get mistakes() {
    return this.player.GlMst;
  }

  get savesHeldPercentage() {
    const saves = this.player.Svh! + this.player.Svp! + this.player.Svt!;
    if (saves === 0) {
      return 0;
    }
    const svhp = this.player.Svh / saves;
    return Math.round((svhp + Number.EPSILON) * 100) / 100;
  }
}
