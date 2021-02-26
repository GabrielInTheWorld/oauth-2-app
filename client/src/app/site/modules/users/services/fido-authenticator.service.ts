import { Injectable } from '@angular/core';

import { CryptoService } from './../../../../core/services/crypto.service';
import { SocketService } from './../../../../core/services/socket.service';
import { HttpService } from 'src/app/core/services/http.service';

enum FidoAuthenticationStep {
    /**
     * First, request a server.
     */
    REQUEST = 'request',
    /**
     * Received a challenge from server.
     */
    CHALLENGE = 'challenge',
    /**
     * Second, provide a credential to that server.
     */
    CREDENTIAL = 'credential'
}

interface CredentialLike {
    id: string;
    rawId: string;
    response: {
        attestationObject: string;
        clientDataJSON: string;
    };
    type: string;
}

interface FidoAuthentication {
    event: FidoAuthenticationStep;
    content?: any;
}

@Injectable({
    providedIn: 'root'
})
export class FidoAuthenticatorService {
    public constructor(
        private readonly socket: SocketService,
        private readonly crypto: CryptoService,
        private http: HttpService
    ) {}

    public register(username: string): void {
        // this.http.get('make-credential').then(async (answer: any) => {
        //     console.log('answer from http:', answer);

        //     if (answer.success) {
        //         delete answer.success;
        //     }
        //     if (answer.message) {
        //         delete answer.message;
        //     }
        //     answer.challenge = Uint8Array.from(answer.challenge, (c: string) => c.charCodeAt(0));
        //     answer.user.id = Uint8Array.from(answer.user.id, (c: string) => c.charCodeAt(0));
        //     const credential = await navigator.credentials.create({ publicKey: answer });
        //     this.http.post('make-credential', credential).then(created => console.log('after posting:', created));
        // });
        this.socket
            .emit<FidoAuthentication, FidoAuthentication>('fido-register', { event: FidoAuthenticationStep.REQUEST })
            .subscribe(answer => {
                console.log('answer from server', answer);
                this.onRegister(answer, username);
            });
    }

    private async onRegister(answer: FidoAuthentication, username: string): Promise<void> {
        switch (answer.event) {
            case FidoAuthenticationStep.CHALLENGE:
                const credential = await this.onAnswerFromServer(answer.content, username, pubCredential => {
                    // console.log('pubCredential', pubCredential);
                    // this.http.post('fido-register', pubCredential);
                    // this.socket.emit('fido-register', {
                    //     event: FidoAuthenticationStep.CREDENTIAL,
                    //     content: { credential: pubCredential }
                    // });
                });
                // console.log('sending the following credential to server:', credential);
                // this.http.post('fido-register', { credential });
                this.socket.emit('fido-register', {
                    event: FidoAuthenticationStep.CREDENTIAL,
                    content: { credential }
                });
                break;
        }
    }

    private async onAnswerFromServer(
        answer: any,
        username: string,
        callback: (credential: any) => void
    ): Promise<Credential> {
        const publicKeyCredentialCreationOptions = JSON.parse(JSON.stringify(answer));
        publicKeyCredentialCreationOptions.challenge = atob(publicKeyCredentialCreationOptions.challenge);
        publicKeyCredentialCreationOptions.user.id = atob(publicKeyCredentialCreationOptions.user.id);
        publicKeyCredentialCreationOptions.challenge = Uint8Array.from(
            publicKeyCredentialCreationOptions.challenge,
            (c: string) => c.charCodeAt(0)
        );
        publicKeyCredentialCreationOptions.user.id = Uint8Array.from(
            publicKeyCredentialCreationOptions.user.id,
            (c: string) => c.charCodeAt(0)
        );
        console.log('onAnswerFromServer:', publicKeyCredentialCreationOptions);
        // const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        //     challenge: Uint8Array.from(answer, c => c.charCodeAt(0)),
        //     rp: {
        //         name: 'Demonstrator',
        //     },
        //     user: {
        //         id: Uint8Array.from(this.crypto.generateRandomString(8), c => c.charCodeAt(0)),
        //         name: username,
        //         displayName: username
        //     },
        //     pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        //     authenticatorSelection: {
        //         authenticatorAttachment: 'cross-platform',
        //         userVerification: 'discouraged'
        //     },
        //     timeout: 60000,
        //     attestation: 'direct'
        // };
        const credential = (await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        })) as any;
        console.log('created credentials', credential);
        // const copiedCredential = JSON.parse(JSON.stringify(credential));
        // console.log('copied credential:', JSON.stringify(credential));
        const credentialLike: CredentialLike = {
            id: credential.id,
            rawId: this.toString(credential.rawId),
            response: {
                attestationObject: this.toString(credential.response.attestationObject),
                clientDataJSON: this.toString(credential.response.clientDataJSON)
            },
            type: credential.type
        };
        callback(credentialLike);
        return credentialLike;
    }

    private toString(buffer: ArrayBuffer): string {
        const encoded = String.fromCharCode.apply(null, new Uint8Array(buffer));
        console.log('buffer', encoded, btoa(encoded));
        return btoa(encoded);
    }
}
