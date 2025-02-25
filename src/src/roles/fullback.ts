import { Player } from "../types";
import { displayDate, formatWage, printTable } from "../utils";
import { applyFilters, filterMap } from "./_filter";
import { Role, IRole } from "./_role";

interface IFullback extends IRole {
  height: number;
  mistakes: number;
  tackleRating: number;
  tacklesPer90: number;
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
}

export class FullbackProcessor {
  playersLeft: LeftFullback[];
  playersRight: RightFullback[];
  constructor(players: Player[]) {
    const pl = players.filter(LeftFullback.isRole);
    const pr = players.filter(RightFullback.isRole);

    this.playersLeft = pl.map((p) => new LeftFullback(p));
    this.playersRight = pr.map((p) => new RightFullback(p));
  }

  filter() {
    const filterMap: filterMap<Fullback> = {
      // noMistakesFilter: (d: Fullback) => d.mistakes <= 1,
      noInjuriesFilter: (d: Fullback) => !d.injuries,
      // headerRatioFilter: (d: Fullback) => d.headersWonRatio >= 70,
      // tacklesRationFilter: (d: Fullback) => d.tackleRating >= 75,
      notEmptyFilter: (f: Fullback) =>
        f.progressivePassesPer90 > 0 || f.openSucessfullCrosses90 > 0,
      wageFilter: (d: Fullback) => d.wage <= 120000,
      arealFiilters: (d: Fullback) =>
        d.arealAttempsPer90 > 3 && d.headersWonRatio > 50,
    };

    const filteredLeft = applyFilters(this.playersLeft, filterMap);
    const filteredRight = applyFilters(this.playersRight, filterMap);

    return [filteredLeft, filteredRight].flat();
  }

  print(fullbacks: Array<LeftFullback | RightFullback>) {
    this.realPrint(
      fullbacks.filter((f) => f.side === "left"),
      "left"
    );
    this.realPrint(
      fullbacks.filter((f) => f.side === "right"),
      "right"
    );
  }

  private realPrint(fbList: Fullback[], side: "left" | "right") {
    const display = fbList.map((g) => {
      const {
        uid,
        name,
        nat,
        progressivePassesPer90: prPass,
        passesPercent,
        arealAttempsPer90: ArealAttps,
        headersWonRatio,
        tacklesPer90: tclks,
        tackleRating: tclsR,
        posessionLostPer90: posLost,
        posessionWonPer90: posWon,
        contractExpires,
        wage,
        openCrossesRatio,
        openSucessfullCrosses90,
        successfullPressures90,
        xA,
        keyPasses,
        dribbles,
      } = g;
      return {
        uid,
        name,
        nat,
        ArealAttps,
        "hdrs%": headersWonRatio,
        "pass%": passesPercent,
        prPass,
        tclks,
        tclsR,
        posWon,
        posLost,
        posDif: (posWon - posLost).toFixed(2),
        xA,
        keyPasses,
        dribbles,
        "openCrs%": openCrossesRatio,
        oCrsAtt: ((openSucessfullCrosses90 / openCrossesRatio) * 100).toFixed(
          2
        ),
        oCrsC: openSucessfullCrosses90,
        press: successfullPressures90,
        wage: wage ? formatWage(wage) : null,
        contractExpires: contractExpires ? displayDate(contractExpires) : null,
      };
    });
    console.log(`There is ${display.length} ${side} defenders to watch`);
    printTable(display);
  }
}

class Fullback extends Role implements IFullback {
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some(
      (p) => (p.type === "D" && p.side?.includes("L")) || p.side?.includes("R")
    );
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
}

class LeftFullback extends Fullback {
  readonly side = "left";
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some((p) => p.type === "D" && p.side?.includes("L"));
  }
}
class RightFullback extends Fullback {
  readonly side = "right";
  constructor(player: Player) {
    super(player);
  }

  static isRole(player: Player): boolean {
    return player.Position.some((p) => p.type === "D" && p.side?.includes("R"));
  }
}
