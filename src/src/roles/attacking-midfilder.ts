import { getFilters } from "../filters";
import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters } from "./_filter";
import { Role, IRole } from "./_role";

interface IAttackingMidfilder extends IRole {
  progressivePassesPer90: number;
  passesPercent: number;
  posessionWonPer90: number;
  posessionLostPer90: number;
  keyPasses: number;
  dribbles: number;
  xA: number;
  conv: number;
  npXG: number;
}

export class AttackingMidfilderProcessor {
  players: AttackingMidfilder[];
  constructor(players: Player[]) {
    const pl = players.filter(AttackingMidfilder.isRole);

    this.players = pl.map((p) => new AttackingMidfilder(p));
  }

  filter() {
    const filtered = applyFilters(this.players, {
      noInjuriesFilter: getFilters().noInjuriesFilter,
      minutes: getFilters().timePlayed,
      notEmptyFilter: (f: AttackingMidfilder) =>
        f.progressivePassesPer90 > 0 && f.conv > 0,
      keyPases: (f: AttackingMidfilder) => f.keyPasses > 1.5,
      // wageFilter: (d: AttackingMidfilder) => d.wage <= 100000,
    });

    return filtered;
  }

  print(defenders: AttackingMidfilder[]) {
    const display = defenders.map((g) => {
      const {
        uid,
        name,
        nat,
        progressivePassesPer90: prPass,
        passesPercent,
        keyPasses,
        dribbles,
        xA,
        npXG,
        conv,
        contractExpires,
        wage,
      } = g;
      return {
        uid,
        name,
        nat,
        "pass%": passesPercent,
        prPass,
        keyPasses,
        dribbles,
        xA,
        npXG,
        conv,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} attacking midfilders to watch`);
    printTable(display);
  }
}

export class AttackingMidfilder extends Role implements IAttackingMidfilder {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) => (p.type === "M" || p.type === "AM") && p.side?.includes("C")
    );
  }

  get progressivePassesPer90() {
    return this.player.PrPassesPer90;
  }

  get passesPercent() {
    return this.player.PasPercentage;
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

  get xA() {
    return this.player.xAPer90;
  }

  get conv() {
    return this.player.ConvPercentage;
  }

  get npXG() {
    return this.player.NPxGPer90;
  }
}
