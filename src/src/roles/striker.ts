import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface IStriker extends IRole {
  headersWonRatio: number;
  arealAttempsPer90: number;
  pressAPer90: number;
  xA: number;
  xgOP: number;
  npXG: number;
  shots90: number;
  conv: number;
  drbls: number;
}

export class StrikersProcessor {
  players: Striker[];
  constructor(players: Player[]) {
    const pl = players.filter(Striker.isRole);

    this.players = pl.map((p) => new Striker(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noInjuriesFilter: (d: Striker) => !d.injuries,
      wageFilter: (d: Striker) => d.wage <= 120000,
      doesntWasteMoments: (d) => d.xgOP > 0,
      // npXG: (d: Striker) => d.npXG > 0.3,
      conv: (d) => d.conv > 20,
    });

    return filtered;
  }

  print(defenders: Striker[]) {
    const display = defenders.map((g) => {
      const {
        uid,
        name,
        nat,
        xgOP,
        npXG,
        conv,
        shots90,
        xA,
        drbls,
        pressAPer90,
        arealAttempsPer90: ArealAttPer90,
        headersWonRatio: hdrsWonRatio,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        xgOP,
        npXG,
        conv,
        shots90,
        xA,
        drbls,
        pressAPer90,
        ArealAttPer90,
        hdrsWonRatio,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} strikers to watch`);
    printTable(display);
  }
}

export class Striker extends Role implements IStriker {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some((p) => p.type === "ST");
  }

  get headersWonRatio() {
    return this.player.HdrPercentage;
  }

  get arealAttempsPer90() {
    return this.player.AerAPer90;
  }
  get pressAPer90() {
    return this.player.PresAPer90;
  }
  get xA() {
    return this.player.xAPer90;
  }

  get xgOP() {
    return this.player.xGOP;
  }

  get npXG() {
    return this.player.NPxGPer90;
  }

  get shots90() {
    return this.player.ShTPer90;
  }

  get conv() {
    return this.player.ConvPercentage;
  }

  get drbls() {
    return this.player.DrbPer90;
  }
}
