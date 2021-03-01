import { MakeCredentialResponse } from './../model-layer/core/models/fido/index';
import cbor from 'cbor';
import CBOR from 'cbor-sync';
import * as vanillacbor from '../util/helper/vanilla-cbor';
import { AttestationResult, ExpectedAttestationResult, Fido2Lib } from 'fido2-library';
import { WebsocketHandler } from 'reactive-websocket';
import { Base64 } from 'base-coding';

import { Inject } from '../model-layer/core/modules/decorators';
import { UserHandler } from '../model-layer/user/user-handler';
import { UserService } from '../model-layer/user/user-service';
import { Random } from '../util/helper';
import { Logger } from './logger';
import { Fido } from '../util/authentication/services/fido-service';
import { Config } from '../util/config';

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

const parseAuthData = (buffer: Buffer) => {
  if (buffer.byteLength < 37) {
    throw new Error('Authenticator Data must be at least 37 bytes long!');
  }

  let rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);

  /* Flags */
  let flagsBuffer = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  let flagsInt = flagsBuffer[0];
  let up = !!(flagsInt & 0x01); // Test of User Presence
  let uv = !!(flagsInt & 0x04); // User Verification
  let at = !!(flagsInt & 0x40); // Attestation data
  let ed = !!(flagsInt & 0x80); // Extension data
  let flags = { up, uv, at, ed, flagsInt };

  let counterBuffer = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  let counter = counterBuffer.readUInt32BE(0);

  /* Attested credential data */
  let aaguid = undefined;
  let aaguidBuffer = undefined;
  let credIdBuffer = undefined;
  let cosePublicKeyBuffer = undefined;
  let attestationMinLen = 16 + 2 + 16 + 77; // aaguid + credIdLen + credId + pk

  if (at) {
    // Attested Data
    if (buffer.byteLength < attestationMinLen) {
      throw new Error(
        `It seems as the Attestation Data flag is set, but the remaining data is smaller than ${attestationMinLen} bytes. You might have set AT flag for the assertion response.`
      );
    }

    aaguid = buffer.slice(0, 16).toString('hex');
    buffer = buffer.slice(16);
    aaguidBuffer = `${aaguid.slice(0, 8)}-${aaguid.slice(8, 12)}-${aaguid.slice(12, 16)}-${aaguid.slice(
      16,
      20
    )}-${aaguid.slice(20)}`;

    let credIdLenBuffer = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    let credIdLen = credIdLenBuffer.readUInt16BE(0);
    credIdBuffer = buffer.slice(0, credIdLen);
    buffer = buffer.slice(credIdLen);

    let pubKeyLength = vanillacbor.decodeOnlyFirst(buffer).byteLength;
    cosePublicKeyBuffer = buffer.slice(0, pubKeyLength);
    buffer = buffer.slice(pubKeyLength);
  }

  let coseExtensionsDataBuffer = undefined;
  if (ed) {
    // Extension Data
    let extensionsDataLength = vanillacbor.decodeOnlyFirst(buffer).byteLength;

    coseExtensionsDataBuffer = buffer.slice(0, extensionsDataLength);
    buffer = buffer.slice(extensionsDataLength);
  }

  if (buffer.byteLength) throw new Error('Failed to decode authData! Leftover bytes been detected!');

  return {
    rpIdHash,
    counter,
    flags,
    counterBuffer,
    aaguid,
    credIdBuffer,
    cosePublicKeyBuffer,
    coseExtensionsDataBuffer
  };
};

export class FidoProviderService {
  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  // @Inject(UserService)
  // private readonly userHandler: UserHandler;

  private readonly f2l = new Fido2Lib({
    challengeSize: 128,
    attestation: 'direct',
    // cryptoParams: [-7, -257],
    cryptoParams: [-7],
    authenticatorAttachment: 'cross-platform',
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: 'discouraged',
    rpName: 'http://localhost:8000'
  });

  private readonly pendingRegister: { [key: string]: string } = {};

  public constructor() {
    // this.websocket.fromEvent('fido-register').subscribe((message: any) => {
    //   console.log('Received the following request:', message);
    //   const request = message.data;
    //   console.log('Received the following data:', request);
    //   const socketId = message.socketId;
    //   try {
    //     this.onRegister(socketId, request);
    //   } catch (e) {
    //     Logger.warn('Something went wrong:', e);
    //     Logger.warn('RETURN!');
    //   }
    // });
  }

  public async createOptions(): Promise<any> {
    // throw new Error('Todo');
    return await this.f2l.attestationOptions();
  }

  public createOptionsInstantly(args: { userId?: string; username: string }): any {
    return {
      challenge: this.createChallenge(),
      rp: {
        name: 'http://localhost:8000'
      },
      user: {
        id: args.userId || Buffer.from(Uint8Array.from(Random.cryptoKey(8), c => c.charCodeAt(0))).toString('base64'),
        name: args.username,
        displayName: args.username
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

  public async register(username: string, userId?: string): Promise<any> {
    return new Promise(async resolve => {
      const publicKeyCredentialCreationOptions = await this.createOptions();
      const id = userId || Random.id();
      console.log('id:', id);
      publicKeyCredentialCreationOptions.user = {
        id: Base64.encode(id),
        // id: Buffer.from(id).toString('base64'),
        name: username,
        displayName: username
      };
      // publicKeyCredentialCreationOptions.user.id = Buffer.from(publicKeyCredentialCreationOptions.user.id).toString(
      //   'base64'
      // );
      this.pendingRegister[id] = publicKeyCredentialCreationOptions.challenge;
      publicKeyCredentialCreationOptions.challenge = Buffer.from(publicKeyCredentialCreationOptions.challenge).toString(
        'base64'
      );
      // const publicKeyCredentialCreationOptions = this.createOptionsInstantly({ username, userId });
      const subscription = this.websocket
        .broadcastAll<any>({
          event: 'fido-register',
          data: {
            event: FidoAuthenticationStep.CHALLENGE,
            content: { publicKeyCredentialCreationOptions, userId: id }
          }
        })
        .subscribe(message => {
          resolve(this.onChallenge(message.socketId, message.data));
          subscription.unsubscribe();
        });
    });
  }

  public async loginRequest(username: string): Promise<any> {
    // const user = await this.userHandler.getUserByUsername(username);
    // const publicKeyCredentialRequestOptions = {
    //   challenge: this.createChallenge(),
    //   allowCredentials: [
    //     {
    //       id: Uint8Array.from(user.fido?.credentialId, (c: string) => c.charCodeAt(0)),
    //       type: 'public-key',
    //       transports: ['usb', 'ble', 'nfc']
    //     }
    //   ],
    //   timeout: 60000
    // };
    // return publicKeyCredentialRequestOptions;
    // const assertion = await navigator.credentials.get({
    //   publicKey: publicKeyCredentialRequestOptions
    // });
  }

  public async loginConfirm(): Promise<any> {}

  private onChallenge(socketId: string, request: FidoAuthentication): any {
    if (!request.content || !request.content.credential) {
      Logger.warn('No credentials provided!\n\rRETURN!');
      return;
    }
    // return this.decode2(request.content.credential);
    // return this.decode(request);
    return this.validateAttestation(request.content.credential, request.content.userId);
  }

  private async validateAttestation(receivedResult: any, userId: any): Promise<any> {
    console.log('receivedResult', receivedResult);
    console.log('id', userId);
    console.log('pendingusers:', this.pendingRegister);
    // receivedResult.response.clientDataJSON = Buffer.from(receivedResult.response.clientDataJSON, 'base64');
    // receivedResult.response.clientDataJSON = Base64.decode(receivedResult.response.clientDataJSON);
    // receivedResult.response.attestationObject = Buffer.from(receivedResult.response.attestationObject, 'base64');
    receivedResult.id = receivedResult.id;
    receivedResult.rawId = Uint8Array.from(receivedResult.rawId, (c: any) => c.charCodeAt(0)).buffer;
    console.log('receivedResult after converting:', receivedResult);

    const expectedResult: any = {
      challenge: this.pendingRegister[userId],
      origin: Config.isProductionMode() ? 'http://localhost:8000' : 'http://localhost:4200',
      factor: 'either'
    };
    const result = await this.f2l.attestationResult(receivedResult, expectedResult);
    return {
      publicKeyPem: result.authnrData.get('credentialPublicKeyPem'),
      counter: result.authnrData.get('counter'),
      credentialId: Buffer.from(result.authnrData.get('credId'))
    };
  }

  private decode2(credential: CredentialLike): any {
    // console.log(
    //   'clientDataJSON',
    //   credential.response.clientDataJSON,
    //   '\n',
    //   Base64.decode(credential.response.clientDataJSON)
    // );
    const clientData = JSON.parse(Base64.decode(credential.response.clientDataJSON));
    console.log('clientData', clientData);
    const attestationObject = credential.response.attestationObject;
    const attestationObjectBuffer = Buffer.from(attestationObject, 'base64');
    const ctapMakeCredResponse: MakeCredentialResponse = cbor.decodeAllSync(attestationObjectBuffer)[0];
    console.log('ctapMakeCredResponse', ctapMakeCredResponse);

    const authData = parseAuthData(ctapMakeCredResponse.authData);
    console.log('authData', authData);

    return {
      publicKeyBytes: authData.cosePublicKeyBuffer,
      x5c: ctapMakeCredResponse.attStmt.x5c[0],
      credentialId: authData.credIdBuffer,
      counter: authData.counter
    };
    // throw new Error('Not implemented');
  }

  private decode(request: any): any {
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

    const decodedAttestationObject = cbor.decodeAllSync(attestationObject)[0];

    console.log('decodedAttestationObject', decodedAttestationObject);
    // console.log('x5c', )

    console.log('clientDataObj', clientDataObj);

    // console.log('typeof:', decodedAttestationObject.authData instanceof Uint8Array);

    const { authData }: { authData: any } = decodedAttestationObject;

    // get the length of the credential ID
    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    idLenBytes.forEach((value: any, index: number) => dataView.setUint8(index, value));
    const credentialIdLength = dataView.getUint16(0);

    // get the credential ID
    const credentialId = authData.slice(55, 55 + credentialIdLength);
    console.log('credentialId:', credentialIdLength, credentialId);

    // get the public key object
    const publicKeyBytes = authData.slice(55 + credentialIdLength);
    // console.log('publicKeyBytes', publicKeyBytes, publicKeyBytes.verify, Buffer.from(publicKeyBytes.buffer));

    console.log('publicKeyBytes', publicKeyBytes.buffer);
    // the publicKeyBytes are encoded again as CBOR
    const bla = vanillacbor.decodeOnlyFirst(publicKeyBytes);
    console.log('bla', bla);
    const publicKeyObject = vanillacbor.decodeOnlyFirst(publicKeyBytes)[0];
    console.log('publicKeyObject:', publicKeyObject);
    // console.log('credentialId:', credentialId);
    // return {
    //   publicKeyBytes: Buffer.from(publicKeyBytes).toString('base64'),
    //   publicKeyObject: Buffer.from(publicKeyObject).toString('base64'),
    //   credentialId: Buffer.from(credentialId).toString('base64'),
    //   x5c: Buffer.from(decodedAttestationObject.attStmt.x5c[0]).toString('base64')
    // };
    return {
      publicKeyBytes: publicKeyBytes,
      publicKeyObject: publicKeyObject,
      credentialId: credentialId,
      x5c: decodedAttestationObject.attStmt.x5c[0]
    };
  }

  private onRegister(socketId: string, request: FidoAuthentication): void {
    switch (request.event) {
      case FidoAuthenticationStep.REQUEST:
        const args = { userId: request.content.userId, username: request.content.username };
        const publicKeyCredentialCreationOptions = this.createOptionsInstantly(args);
        // this.pendingRegister[]
        this.websocket.emit(socketId, {
          event: 'fido-register',
          data: { event: FidoAuthenticationStep.CHALLENGE, content: publicKeyCredentialCreationOptions }
        });
        // this.createOptions().then((options: any) => {
        //   options.user = {
        //     id: Random.id(),
        //     name: 'Demo User',
        //     displayName: 'Demo User'
        //   };
        //   options.user.id = Buffer.from(options.user.id).toString('base64');
        //   options.challenge = Buffer.from(options.challenge).toString('base64');
        //   console.log('Submitted challenge:', options.challenge);
        //   this.websocket.emit(socketId, {
        //     event: 'fido-register',
        //     data: { event: FidoAuthenticationStep.CHALLENGE, content: options }
        //   });
        // });
        break;
      case FidoAuthenticationStep.CREDENTIAL:
        if (!request.content || !request.content.credential) {
          Logger.warn('No credentials provided!\n\rRETURN!');
          return;
        }

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

        const decodedAttestationObject = CBOR.decode(attestationObject);

        console.log('decodedAttestationObject', decodedAttestationObject);

        console.log('clientDataObj', clientDataObj);

        // console.log('typeof:', decodedAttestationObject.authData instanceof Uint8Array);

        const { authData }: { authData: any } = decodedAttestationObject;

        // get the length of the credential ID
        const dataView = new DataView(new ArrayBuffer(2));
        const idLenBytes = authData.slice(53, 55);
        idLenBytes.forEach((value: any, index: number) => dataView.setUint8(index, value));
        const credentialIdLength = dataView.getUint16(0);

        // get the credential ID
        const credentialId = authData.slice(55, 55 + credentialIdLength);
        console.log('credentialId:', credentialIdLength, credentialId);

        // get the public key object
        const publicKeyBytes = authData.slice(55 + credentialIdLength);
        console.log('publicKeyBytes', Buffer.from(publicKeyBytes.buffer));

        // the publicKeyBytes are encoded again as CBOR
        const publicKeyObject = CBOR.decode(Buffer.from(publicKeyBytes.buffer), 'buffer');
        console.log(publicKeyObject);
        console.log('credentialId:', credentialId);

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

  private createChallenge(): string {
    return Buffer.from(Uint8Array.from(Random.cryptoKey(), c => c.charCodeAt(0))).toString('base64');
  }
}
