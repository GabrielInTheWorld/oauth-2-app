import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
    @Input()
    public fullHeight = false;

    @Input()
    public centering = false;

    public constructor() {}

    public ngOnInit(): void {}
}
