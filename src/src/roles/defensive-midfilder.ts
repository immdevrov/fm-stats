import { getFilters } from "../filters";
import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface IDefensiveMidfilder extends IRole {
  tackleRating: number;
  tacklesPer90: number;
  progressivePassesPer90: number;
  passesPercent: number;
  headersWonRatio: number;
  arealAttempsPer90: number;
  posessionWonPer90: number;
  posessionLostPer90: number;
  keyPasses: number;
}

export class DefensiveMidfilderProcessor {
  players: DefensiveMidfilder[];
  constructor(players: Player[]) {
    const pl = players.filter(DefensiveMidfilder.isRole);

    this.players = pl.map((p) => new DefensiveMidfilder(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noInjuriesFilter: getFilters().noInjuriesFilter,
      timePlayed: getFilters().timePlayed,
      // headerRatioFilter: (d: DefensiveMidfilder) => d.headersWonRatio >= 70,
      // tacklesRationFilter: (d: DefensiveMidfilder) => d.tackleRating >= 75,
      notEmptyFilter: (f: DefensiveMidfilder) => f.posessionWonPer90 > 0,
      wageFilter: (d: DefensiveMidfilder) => d.wage <= 100000,
      doNotLostBall: (d: DefensiveMidfilder) => d.posessionLostPer90 < 10,
      tackles: (d: DefensiveMidfilder) => d.tackleRating > 70,
      headers: (d: DefensiveMidfilder) => d.headersWonRatio > 40,
      passes: (d: DefensiveMidfilder) => d.passesPercent >= 88,
      prPasses: (d: DefensiveMidfilder) => d.progressivePassesPer90 >= 5,
    });

    return filtered;
  }

  print(defenders: DefensiveMidfilder[]) {
    const display = defenders.map((g) => {
      const {
        uid,
        name,
        nat,
        progressivePassesPer90: prPass,
        passesPercent,
        arealAttempsPer90: ArealAttps,
        headersWonRatio: hdrsWonRatio,
        tacklesPer90: tclks,
        tackleRating: tclsR,
        posessionLostPer90: posLost,
        posessionWonPer90: posWon,
        keyPasses,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        ArealAttps,
        hwr: hdrsWonRatio,
        "pass%": passesPercent,
        prPass,
        tclks,
        tclsR,
        posLost,
        posWon,
        keyPasses,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} def midfilders to watch`);
    printTable(display);
  }
}

export class DefensiveMidfilder extends Role implements IDefensiveMidfilder {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) => (p.type === "M" && p.side?.includes("C")) || p.type === "DM"
    );
  }

  get tackleRating() {
    return this.player.TckR;
  }

  get progressivePassesPer90() {
    return this.player.PrPassesPer90;
  }

  get passesPercent() {
    return this.player.PasPercentage;
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

  get keyPasses() {
    return this.player.OPKPPer90;
  }
}
