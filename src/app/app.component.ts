import { ChangeDetectorRef, Component } from '@angular/core';
import { interval } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

interface ResultWeight {
  small: boolean,
  medium: boolean,
  large: boolean,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public currentWeight: number = 0;
  public currentWeightInPercent: number = 0;
  public isWeightingProcess: boolean = false;
  public isDoneWeight: boolean = false;
  public userWeightsMock: number[] = []
  public weightSubscription: any;
  private previousWeightValue: number = 0;
  public resultWeight: ResultWeight = {
    small: false,
    medium: false,
    large: false,
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) {}

  public startWeight() {
    this.fillWeightsMock();

    this.weightSubscription = interval(10)
      .pipe(
        take(this.userWeightsMock.length),
        map(i => this.userWeightsMock[i]),
        finalize(() => {
          this.applyDoneWeight();
        })
      ).subscribe((data: any) => {
        //issue a fix for the case where we get a weight that is less than the previous data weight
        if (this.previousWeightValue < parseInt(data.toFixed())) {
          this.previousWeightValue = parseInt(data.toFixed(2));
          this.currentWeight = data.toFixed(2);

          this.currentWeightInPercent = (data * 100)/120;
        }

      })
  }

  public buttonClickHandler(weight: string): void {
    this.isWeightingProcess = true;

    switch (true) {
      case weight === 'small' :
        this.currentWeight = this.setRandomWeightForAnimal(0, 40);
        this.startWeight();
        break;
      case weight === 'medium' :
        this.currentWeight = this.setRandomWeightForAnimal(41, 80);
        this.startWeight();
        break;
      case weight === 'large' :
        this.currentWeight = this.setRandomWeightForAnimal(81, 120);
        this.startWeight();
        break;
      default:
        this.currentWeight = 0;
        this.startWeight();
        break;
    }
  }

  public weightAgain(): void {
    this.isWeightingProcess = false;
    this.resultWeight.small = this.resultWeight.medium = this.resultWeight.large = false;
    this.currentWeight = 0;
    this.currentWeightInPercent = 0;
    this.isDoneWeight = false;
    this.userWeightsMock = [];
    this.previousWeightValue = 0;
  }

  public applyDoneWeight(): void {
    this.setCurrentSizeOfAnimal();
    this.isDoneWeight = true;
    this.changeDetector.markForCheck();
  }

  private setRandomWeightForAnimal(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private fillWeightsMock() {
    //imitation of indications of the weighing process
    this.userWeightsMock = [];
    let weightCount: number = 0;

    while (weightCount <= this.currentWeight) {
      weightCount= weightCount + Math.random() * (0.1 - 0.05) + 0.1;
      this.userWeightsMock.push(weightCount);
    }
  }

  private setCurrentSizeOfAnimal(): void {
    switch (true) {
      case this.currentWeight > 40 && this.currentWeight <= 80 :
        this.resultWeight.small = this.resultWeight.large = false;
        this.resultWeight.medium = true;
        break;
      case this.currentWeight > 80 :
        this.resultWeight.small = this.resultWeight.medium = false;
        this.resultWeight.large = true;
        break;
      case this.currentWeight <= 40 :
        this.resultWeight.medium = this.resultWeight.large = false;
        this.resultWeight.small = true;
        break;
      default:
        this.resultWeight.small = this.resultWeight.medium = this.resultWeight.large = false;
    }
  }
}
