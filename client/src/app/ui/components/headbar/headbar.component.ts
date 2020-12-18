import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-headbar',
    templateUrl: './headbar.component.html',
    styleUrls: ['./headbar.component.scss']
})
export class HeadbarComponent implements OnInit {
    @Output()
    public add = new EventEmitter<void>();

    public constructor() {}

    public ngOnInit(): void {
        console.log('Observers', this.add.observers);
    }
}
