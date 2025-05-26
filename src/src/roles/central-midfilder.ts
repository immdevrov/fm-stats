import { getFilters } from "../filters";
import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface ICentralMidfilder extends IRole {
  tackleRating: number;
  tacklesPer90: number;
  progressivePassesPer90: number;
  passesPercent: number;
  posessionWonPer90: number;
  posessionLostPer90: number;
  keyPasses: number;
  sprints: number;
  distance: number;
  dribbles: number;
  pressures: number;
}

export class CentralMidfilderProcessor {
  players: CentralMidfilder[];
  constructor(players: Player[]) {
    const pl = players.filter(CentralMidfilder.isRole);

    this.players = pl.map((p) => new CentralMidfilder(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noInjuriesFilter: getFilters().noInjuriesFilter,
      minutes: getFilters().timePlayed,
      notEmptyFilter: (f: CentralMidfilder) => f.posessionWonPer90 > 0,
      wageFilter: (d: CentralMidfilder) => d.wage <= 100000,
      // ballRetention: (d: CentralMidfilder) =>
      //   d.posessionWonPer90 - d.posessionLostPer90 > 0,
      distanse: (d: CentralMidfilder) => d.distance > 12.5,
      tackles: (d: CentralMidfilder) => d.tackleRating > 70,
      headers: (d: CentralMidfilder) => d.headersWonRatio > 40,
      progressViaPassOrCarry: (d: CentralMidfilder) =>
        d.progressivePassesPer90 > 4.5 || d.dribbles > 1.2,
    });

    return filtered;
  }

  print(defenders: CentralMidfilder[]) {
    const display = defenders.map((g) => {
      const {
        uid,
        name,
        nat,
        progressivePassesPer90: prPass,
        passesPercent,
        tacklesPer90: tclks,
        tackleRating: tclsR,
        posessionLostPer90: posLost,
        posessionWonPer90: posWon,
        headersWonRatio,
        keyPasses,
        dribbles,
        sprints,
        pressures,
        distance,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        "pass%": passesPercent,
        prPass,
        tclks,
        tclsR,
        posLost,
        posWon,
        hwr: headersWonRatio,
        keyPasses,
        dribbles,
        sprints,
        distance,
        pressures,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} central midfilders to watch`);
    printTable(display);
  }
}

export class CentralMidfilder extends Role implements ICentralMidfilder {
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

  get posessionWonPer90() {
    return this.player.PossWonPer90;
  }

  get posessionLostPer90() {
    return this.player.PossLostPer90;
  }

  get keyPasses() {
    return this.player.OPKPPer90;
  }

  get dribbles() {
    return this.player.DrbPer90;
  }

  get sprints() {
    return this.player.SprintsPer90;
  }

  get distance() {
    return this.player.DistPer90;
  }

  get headersWonRatio() {
    return this.player.HdrPercentage;
  }

  get pressures() {
    return this.player.PresCPer90;
  }
}
