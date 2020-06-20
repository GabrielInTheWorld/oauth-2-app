import { Component, OnInit } from '@angular/core';
import { AuthService, ClientProvider } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-oauth',
    templateUrl: './oauth.component.html',
    styleUrls: ['./oauth.component.scss']
})
export class OauthComponent implements OnInit {
    public constructor(private readonly authService: AuthService) {}

    public ngOnInit(): void {}

    public oauthOpenSlides(): void {
        this.authService.oAuth2(ClientProvider.OPENSLIDES);
    }
}
