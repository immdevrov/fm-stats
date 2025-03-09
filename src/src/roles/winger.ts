import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters, filterMap } from "./_filter";
import { Role, IRole } from "./_role";

interface IWinger extends IRole {
  progressivePassesPer90: number;
  passesPercent: number;
  headersWonRatio: number;
  arealAttempsPer90: number;
  posessionWonPer90: number;
  posessionLostPer90: number;
  successfullPressures90: number;
  openCrossesRatio: number;
  openSucessfullCrosses90: number;
  xA: number;
  keyPasses: number;
  dribbles: number;
  npXG: number;
  conv: number;
}

export class WingerProcessor {
  playersLeft: LeftWinger[];
  playersRight: RightWinger[];
  constructor(players: Player[]) {
    const pl = players.filter(LeftWinger.isRole);
    const pr = players.filter(RightWinger.isRole);

    this.playersLeft = pl.map((p) => new LeftWinger(p));
    this.playersRight = pr.map((p) => new RightWinger(p));
  }

  filter() {
    const filterMap: filterMap<Winger> = {
      noInjuriesFilter: (d: Winger) => !d.injuries,
      notEmptyFilter: (f: Winger) =>
        f.progressivePassesPer90 > 0 || f.openSucessfullCrosses90 > 0,
      wageFilter: (d: Winger) => d.wage <= 120000,
      keyPassFilter: (d: Winger) => d.keyPasses > 1.2,
      dribl: (d: Winger) => d.dribbles > 2,
      creatorOrScorer: (d: Winger) => d.xA > 0.2 || d.conv > 10,
    };

    const filteredLeft = applyFilters(this.playersLeft, filterMap);
    const filteredRight = applyFilters(this.playersRight, filterMap);

    return [filteredLeft, filteredRight].flat();
  }

  print(wingers: Array<LeftWinger | RightWinger>) {
    this.realPrint(
      wingers.filter((f) => f.side === "left"),
      "left"
    );
    this.realPrint(
      wingers.filter((f) => f.side === "right"),
      "right"
    );
  }

  private realPrint(fbList: Winger[], side: "left" | "right") {
    const display = fbList.map((g) => {
      const {
        uid,
        name,
        nat,
        progressivePassesPer90: prPass,
        passesPercent,
        arealAttempsPer90: ArealAttps,
        headersWonRatio,
        contractExpires,
        wage,
        openCrossesRatio,
        openSucessfullCrosses90,
        successfullPressures90,
        xA,
        keyPasses,
        dribbles,
        npXG,
        conv,
      } = g;
      return {
        uid,
        name,
        nat,
        aatts: ArealAttps,
        "hdrs%": headersWonRatio,
        "pass%": passesPercent,
        prPass,
        xA,
        kPass: keyPasses,
        drib: dribbles,
        "oCrs%": openCrossesRatio,
        oCrsAtt: ((openSucessfullCrosses90 / openCrossesRatio) * 100).toFixed(
          2
        ),
        press: successfullPressures90,
        npXG,
        conv,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} ${side} wingers to watch`);
    printTable(display);
  }
}

class Winger extends Role implements IWinger {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) =>
        (p.type === "AM" || p.type === "M") &&
        (p.side?.includes("L") || p.side?.includes("R"))
    );
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

  get successfullPressures90() {
    return this.player.PresCPer90;
  }

  get openCrossesRatio() {
    return this.player.OPCrPercentage;
  }

  get openSucessfullCrosses90() {
    return this.player.OPCrsCPer90;
  }

  get xA() {
    return this.player.xAPer90;
  }

  get keyPasses() {
    return this.player.OPKPPer90;
  }

  get dribbles() {
    return this.player.DrbPer90;
  }

  get npXG() {
    return this.player.NPxGPer90;
  }

  get conv() {
    return this.player.ConvPercentage;
  }
}

class LeftWinger extends Winger {
  readonly side = "left";
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) => (p.type === "AM" || p.type === "M") && p.side?.includes("L")
    );
  }
}
class RightWinger extends Winger {
  readonly side = "right";
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) => (p.type === "AM" || p.type === "M") && p.side?.includes("R")
    );
  }
}
