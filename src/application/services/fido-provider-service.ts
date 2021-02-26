import cbor from 'cbor';
// import { AttestationResult, ExpectedAttestationResult, Fido2Lib } from 'fido2-library';
import { WebsocketHandler } from 'reactive-websocket';

import { Inject } from '../model-layer/core/modules/decorators';
import { Random } from '../util/helper';
import { Logger } from './logger';

enum FidoAuthenticationStep {
  REQUEST = 'request',
  CHALLENGE = 'challenge',
  CREDENTIAL = 'credential'
}

interface FidoAuthentication {
  event: FidoAuthenticationStep;
  content?: any;
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

export class FidoProviderService {
  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  // private readonly f2l = new Fido2Lib({
  //   challengeSize: 128,
  //   attestation: 'none',
  //   cryptoParams: [-7, -257],
  //   authenticatorAttachment: 'platform',
  //   authenticatorRequireResidentKey: false,
  //   authenticatorUserVerification: 'required'
  // });

  public constructor() {
    this.websocket.fromEvent('fido-register').subscribe((message: any) => {
      console.log('Received the following request:', message);
      const request = message.data;
      const socketId = message.socketId;
      try {
        this.onRegister(socketId, request);
      } catch (e) {
        Logger.error('Something went wrong:', e);
        Logger.warn('RETURN!');
      }
    });
  }

  public async createOptions(): Promise<any> {
    throw new Error('Todo');
    // return await this.f2l.attestationOptions();
  }

  public createOptionsInstantly(): any {
    return {
      challenge: Buffer.from(Uint8Array.from(Random.cryptoKey(), c => c.charCodeAt(0))).toString('base64'),
      rp: {
        name: 'http://localhost:8000'
      },
      user: {
        id: Buffer.from(Uint8Array.from(Random.cryptoKey(8), c => c.charCodeAt(0))).toString('base64'),
        name: 'username',
        displayName: 'username'
      },
      extensions: {
        txAuthSimple: ''
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        requiredResidentKey: false,
        authenticatorAttachment: 'cross-platform',
        userVerification: 'discouraged'
      },
      timeout: 60000,
      attestation: 'direct'
    };
  }

  public onCredential(credential: any): void {
    console.log('credential:', credential);
    // decode the clientDataJSON into a utf-8 string
    // const utf8Decoder = new TextDecoder('utf-8');
    // // const credential = body.credential;
    // const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON);

    // // parse the string as an object
    // const clientDataObj = JSON.parse(decodedClientData);

    // const decodedAttestationObject = cbor.decode(credential.response.attestationObject);

    // console.log(decodedAttestationObject);

    // console.log(clientDataObj);

    // const { authData } = decodedAttestationObject;

    // // get the length of the credential ID
    // const dataView = new DataView(new ArrayBuffer(2));
    // const idLenBytes = authData.slice(53, 55);
    // idLenBytes.forEach((value: any, index: number) => dataView.setUint8(index, value));
    // const credentialIdLength = dataView.getUint16(0);

    // // get the credential ID
    // const credentialId = authData.slice(55, 55 + credentialIdLength);

    // // get the public key object
    // const publicKeyBytes = authData.slice(55 + credentialIdLength);

    // // the publicKeyBytes are encoded again as CBOR
    // const publicKeyObject = cbor.decode(publicKeyBytes.buffer);
    // console.log(publicKeyObject);
  }

  private async onRegister(socketId: string, request: FidoAuthentication): Promise<void> {
    switch (request.event) {
      case FidoAuthenticationStep.REQUEST:
        // const publicKeyCredentialCreationOptions = this.createOptionsInstantly();
        // this.websocket.emit(socketId, {
        //   event: 'fido-register',
        //   data: { event: FidoAuthenticationStep.CHALLENGE, content: publicKeyCredentialCreationOptions }
        // });
        this.createOptions().then((options: any) => {
          options.user = {
            id: Random.id(),
            name: 'Demo User',
            displayName: 'Demo User'
          };
          options.user.id = Buffer.from(options.user.id).toString('base64');
          options.challenge = Buffer.from(options.challenge).toString('base64');
          console.log('Submitted challenge:', options.challenge);
          this.websocket.emit(socketId, {
            event: 'fido-register',
            data: { event: FidoAuthenticationStep.CHALLENGE, content: options }
          });
        });
        break;
      case FidoAuthenticationStep.CREDENTIAL:
        if (!request.content || !request.content.credential) {
          Logger.warn('No credentials provided!\n\rRETURN!');
          return;
        }
        /*
        // decode the clientDataJSON into a utf-8 string
        const utf8Decoder = new TextDecoder('utf-8');
        const credential = request.content.credential as CredentialLike;
        console.log('Received credential', credential);
        const clientDataJSON = Buffer.from(credential.response.clientDataJSON, 'base64');
        console.log('clientDataJSON', clientDataJSON);
        const attestationObject = Buffer.from(credential.response.attestationObject, 'base64');
        console.log('attestationObject', attestationObject);
        const decodedClientData = utf8Decoder.decode(clientDataJSON);

        // parse the string as an object
        const clientDataObj = JSON.parse(decodedClientData);

        const decodedAttestationObject = cbor.decode(attestationObject);

        console.log('decodedAttestationObject', decodedAttestationObject);

        console.log('clientDataObj', clientDataObj);

        console.log('typeof:', decodedAttestationObject.authData instanceof Uint8Array);

        const { authData }: { authData: any } = decodedAttestationObject;

        // get the length of the credential ID
        const dataView = new DataView(new ArrayBuffer(2));
        const idLenBytes = authData.slice(53, 55);
        idLenBytes.forEach((value: any, index: number) => dataView.setUint8(index, value));
        const credentialIdLength = dataView.getUint16(0);

        // get the credential ID
        const credentialId = authData.slice(55, 55 + credentialIdLength);

        // get the public key object
        const publicKeyBytes = authData.slice(55 + credentialIdLength);
        console.log('publicKeyBytes', publicKeyBytes.buffer);

        // the publicKeyBytes are encoded again as CBOR
        const publicKeyObject = cbor.decode(publicKeyBytes.buffer);
        console.log(publicKeyObject);
        console.log('credentialId:', credentialId);
        */
        //  Fido2-library
        // const credentialLike = request.content.credential as CredentialLike;
        // const credential: AttestationResult = {
        //   id: Buffer.from(credentialLike.id, 'base64'),
        //   rawId: Buffer.from(credentialLike.rawId, 'base64'),
        //   response: {
        //     attestationObject: credentialLike.response.attestationObject,
        //     clientDataJSON: credentialLike.response.clientDataJSON
        //   }
        // };
        // const attestationExpectations: ExpectedAttestationResult = {
        //   challenge: '33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w',
        //   origin: 'http://localhost:4200',
        //   factor: 'either',
        //   rpId: ''
        // };
        // const regResult = await this.f2l.attestationResult(credential, attestationExpectations);
        // console.log('regResult', regResult);
        break;
    }
  }
}
