// Angular Imports
import { Component, OnInit } from '@angular/core';

// RXJS
import { BehaviorSubject, combineLatest } from 'rxjs';

// Services
import { DataService } from 'app/services/data.service';

// Models
import { Data } from 'app/services/data.model';
import { CheatSheet } from 'app/shared/cheat-sheet/cheat-sheet.model';

// Constants
const dataFile = 'productivity-module-payoffs';

// Data Table Ref:
// https://blog.angularindepth.com/angular-cdk-tables-1537774d7c99
// https://material.angular.io/cdk/table/overview#connecting-the-table-to-a-data-source

interface PayoffData {
    product: string;
    description: string;
    payoff_speed_prod: string;
    payoff_prod: string;
    payoff_beacon_8x8: string;
    payoff_beacon_12: string;
}

@Component({
    selector: 'app-productivity-module-payoffs',
    templateUrl: './productivity-module-payoffs.component.html',
    //   styleUrls: ['./productivity-module-payoffs.component.scss'] // Enable as needed
})
export class ProductivityModulePayoffsComponent implements OnInit {
    public cheatSheet: CheatSheet;

    public displayedColumns = [
        'product',
        'payoff_speed_prod',
        'payoff_prod',
        'payoff_beacon_8x8',
        'payoff_beacon_12',
    ];

    // Sorting Variables
    public tableDataSource$ = new BehaviorSubject<PayoffData[]>([]);
    public sortKey$ = new BehaviorSubject<string>('payoff_speed_prod');
    public sortDirection$ = new BehaviorSubject<string>('asc');

    // Pagination Variables
    public currentPage$ = new BehaviorSubject<number>(1);
    public pageSize$ = new BehaviorSubject<number>(10);
    public dataOnPage$ = new BehaviorSubject<PayoffData[]>([]);


    constructor(
        public dataService: DataService,
    ) { }

    ngOnInit() {
        //  Pagination Subscription
        combineLatest(this.tableDataSource$, this.currentPage$, this.pageSize$)
            .subscribe(([allSources, currentPage, pageSize]) => {
                const startingIndex = (currentPage - 1) * pageSize;
                const onPage = allSources.slice(startingIndex, startingIndex + pageSize);
                this.dataOnPage$.next(onPage);
            });

        // Data/Sorting Subscription
        combineLatest(
            this.dataService.getCheatSheetData(dataFile),
            this.sortKey$, this.sortDirection$,
        ).subscribe(
            ([newData, sortKey, sortDirection]: [Data, string, string]) => {
                this.cheatSheet = newData.cheatSheet;
                const data: PayoffData[] = newData.data;

                // Sort the incoming data
                const sorted = data.sort((a, b) => {
                    if (a[sortKey] > b[sortKey]) { return sortDirection === 'asc' ? 1 : -1; }
                    if (a[sortKey] < b[sortKey]) { return sortDirection === 'asc' ? -1 : 1; }
                    return 0;
                });

                this.tableDataSource$.next(sorted);
            });
    }

    /**
     * Adjusts the sorting arrows for the target column
     * @param key column data variable name
     */
    public adjustSort(key: string) {
        if (this.sortKey$.value === key) {
            if (this.sortDirection$.value === 'asc') {
                this.sortDirection$.next('desc');
            } else {
                this.sortDirection$.next('asc');
            }
            return;
        }

        this.sortKey$.next(key);
        this.sortDirection$.next('asc');
    }
}
