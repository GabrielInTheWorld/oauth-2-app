import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/core/models/base.component';

import { ConsoleService } from '../../services/console.service';

@Component({
    selector: 'app-console',
    templateUrl: './console.component.html',
    styleUrls: ['./console.component.scss']
})
export class ConsoleComponent extends BaseComponent implements OnInit {
    @ViewChild('consoleWrapper')
    public readonly consoleWrapper: ElementRef<HTMLDivElement>;

    public get messages(): string[] {
        return this._messages;
    }

    private _messages: string[] = [];

    public constructor(private readonly consoleService: ConsoleService) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.consoleService.getMessageObservable().subscribe(messages => {
                const copy = [...messages];
                this._messages = copy.reverse();
            })
        );
    }
}
