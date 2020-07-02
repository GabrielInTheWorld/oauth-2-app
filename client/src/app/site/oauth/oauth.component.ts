import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/core/models/base.component';
import { AuthService, ClientProvider, TokenType } from 'src/app/core/services/auth.service';
import { IndicatorColor } from 'src/app/ui/components/indicator/indicator.component';
import { OauthMotionsService } from '../services/oauth-motions.service';

@Component({
    selector: 'app-oauth',
    templateUrl: './oauth.component.html',
    styleUrls: ['./oauth.component.scss']
})
export class OauthComponent extends BaseComponent implements OnInit {
    public get color(): IndicatorColor {
        return this.isInOpenSlidesLoggedIn ? 'green' : 'red';
    }

    public get isInOpenSlidesLoggedIn(): boolean {
        return this.tokenType && !!this.tokenType.accessToken;
    }

    public get hello(): string {
        return this.helloMessage;
    }

    private helloMessage = '';

    public motions: any[] = [];
    public specificMotion: any = null;

    private tokenType: TokenType = null;

    public constructor(
        private readonly authService: AuthService,
        private readonly route: ActivatedRoute,
        private motionService: OauthMotionsService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.authService.TokenTypeObservable.subscribe(token => this.setToken(token)));
        this.subscriptions.push(
            this.route.url.subscribe(urlSegments => console.log('urlSegments', urlSegments)),
            this.route.queryParams.subscribe((queryParams: { state: string; code?: string; user_id?: string }) => {
                console.log('queryParams', queryParams);
                if (queryParams.code) {
                    this.authService.oAuth2Callback(queryParams.code, queryParams.state, queryParams.user_id);
                }
            })
        );
    }

    public oauthOpenSlides(): void {
        this.authService.oAuth2(ClientProvider.OPENSLIDES);
    }

    public goToMotion(id: string): void {
        this.motionService.get(id).then(answer => {
            console.log('motion', answer);
            this.specificMotion = answer.motion;
        });
    }

    public back(): void {
        this.specificMotion = null;
    }

    private setToken(tokenType: TokenType): void {
        if (tokenType) {
            this.tokenType = tokenType;
            this.authService.helloApi().then(answer => console.log('answer from api:', answer));
            this.authService
                .helloOAuth()
                .then(answer => {
                    console.log('answer from oauth 2', answer);
                    this.helloMessage = answer.message;
                })
                .catch(e => console.log('error:', e));
            this.motionService.getAll().then(answer => {
                console.log('answer', answer);
                this.motions = answer.motions;
            });
        }
    }
}
