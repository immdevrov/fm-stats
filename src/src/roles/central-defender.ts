import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface ICentralDefender extends IRole {
  height: number;
  mistakes: number;
  tackleRating: number;
  tacklesPer90: number;
  headersWonRatio: number;
  arealAttempsPer90: number;
  posessionWonPer90: number;
  posessionLostPer90: number;
}

export class CentralDefenderProcessor {
  players: CentralDefender[];
  constructor(players: Player[]) {
    const pl = players.filter(CentralDefender.isRole);

    this.players = pl.map((p) => new CentralDefender(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noMistakesFilter: (d: CentralDefender) => d.mistakes <= 1,
      noInjuriesFilter: (d: CentralDefender) => !d.injuries,
      headerRatioFilter: (d: CentralDefender) => d.headersWonRatio >= 70,
      tacklesRationFilter: (d: CentralDefender) => d.tackleRating >= 75,
      wageFilter: (d: CentralDefender) => d.wage <= 120000,
    });

    return filtered;
  }

  print(defenders: CentralDefender[]) {
    const display = defenders.map((g) => {
      const {
        uid,
        name,
        nat,
        mistakes,
        arealAttempsPer90: ArealAttPer90,
        headersWonRatio: hdrsWonRatio,
        tacklesPer90,
        tackleRating,
        posessionLostPer90: posLostPer90,
        posessionWonPer90: posWonPer90,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        mistakes,
        ArealAttPer90,
        hdrsWonRatio,
        tacklesPer90,
        tackleRating,
        posLostPer90,
        posWonPer90,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} defenders to watch`);
    printTable(display);
  }
}

export class CentralDefender extends Role implements ICentralDefender {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some((p) => p.type === "D" && p.side?.includes("C"));
  }

  get height() {
    return this.player.Height;
  }

  get mistakes() {
    return this.player.GlMst;
  }

  get tackleRating() {
    return this.player.TckR;
  }

  get tacklesPer90() {
    return this.player.TckPer90;
  }

  get headersWonRatio() {
    return this.player.HdrPercentage;
  }

  get arealAttempsPer90() {
    return this.player.AerAPer90;
  }

  get posessionWonPer90() {
    return this.player.PossWonPer90;
  }

  get posessionLostPer90() {
    return this.player.PossLostPer90;
  }
}
