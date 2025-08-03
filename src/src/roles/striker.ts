import { getFilters } from "../filters";
import { Player } from "../types";
import {
  displayDate,
  formatWage,
  getCohort,
  getColumn,
  getPercentile,
  printTable,
  sortIntoCohorts,
} from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface IStriker extends IRole {
  headersWonRatio: number;
  arealAttempsPer90: number;
  xA: number;
  xgOP: number;
  npXG: number;
  shots90: number;
  goals90: number;
  conv: number;
  drbls: number;
  pressures: number;
  tackles90: number;
  posWon90: number;
  keyPasses: number;
}

export class StrikersProcessor {
  players: Striker[];
  constructor(players: Player[]) {
    const pl = players.filter(Striker.isRole);

    this.players = pl.map((p) => new Striker(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noInjuriesFilter: getFilters().noInjuriesFilter,
      minutes: getFilters().timePlayed,
      nonEmpty: (d: Striker) => d.arealAttempsPer90 > 0,
      // wage: (d) => d.wage <= 100000,
      // doesntWasteMoments: (d) => d.xgOP > 0,
      // conv: (d) => d.conv > 20,
    });

    return filtered;
  }

  analize(strikers: IStriker[]) {
    // lets calculate arhetype badges
    const PERCENTILE_TO_ACHIEVE_BADGE = 60;
    const ARHETYPE_NAMES = {
      GOALSCORER: "goalscorer",
      PRESSING_FORWARD: "pressing forward",
      CREATOR: "creator",
    };
    const arhetypes: Record<string, (keyof IStriker)[]> = {
      [ARHETYPE_NAMES.GOALSCORER]: ["conv", "shots90", "goals90"],
      [ARHETYPE_NAMES.PRESSING_FORWARD]: ["pressures", "tackles90", "posWon90"],
    };

    const playersWithArhetype = strikers.map((player) => {
      const result: any = { uid: player.uid, name: player.name, badges: [] };

      for (const [name, properties] of Object.entries(arhetypes)) {
        let score: number = 0;
        for (const prop of properties) {
          const percentile = getPercentile(
            player[prop] as number,
            getColumn(strikers, prop) as number[]
          );
          result[prop] = percentile;
          if (percentile >= PERCENTILE_TO_ACHIEVE_BADGE) {
            score++;
          }
        }
        if (score >= properties.length) {
          result.badges.push(name);
        }
      }
      return result;
    });
    printTable(playersWithArhetype);
  }

  print(strikers: Striker[]) {
    const xACohorts = sortIntoCohorts(getColumn(strikers, "xA"));
    const hdrsCohorts = sortIntoCohorts(getColumn(strikers, "headersWonRatio"));
    const dribblesCohorts = sortIntoCohorts(getColumn(strikers, "drbls"));
    const display = strikers.map((g) => {
      const {
        uid,
        name,
        nat,
        xgOP,
        npXG,
        conv,
        shots90,
        xA,
        keyPasses,
        drbls,
        pressures,
        arealAttempsPer90: ArealAttPer90,
        headersWonRatio: hdrsWonRatio,
        contractExpires,
        wage,
        goals90,
      } = g;
      return {
        uid,
        name,
        nat,
        xgOP,
        npXG,
        conv,
        keyPasses,
        shots90,
        xA: getCohort(xA, xACohorts),
        drbls: getCohort(drbls, dribblesCohorts),
        pressures,
        ArealAttPer90,
        goals90,
        hdrsWonRatio: getCohort(hdrsWonRatio, hdrsCohorts),
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

  get goals90(): number {
    return this.player.goals90;
  }

  get headersWonRatio() {
    return this.player.HdrPercentage;
  }

  get arealAttempsPer90() {
    return this.player.AerAPer90;
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

  get pressures() {
    return this.player.PresCPer90;
  }

  get tackles90() {
    return this.player.TckR;
  }

  get posWon90() {
    return this.player.PossWonPer90;
  }

  get keyPasses() {
    return this.player.OPKPPer90;
  }
}
