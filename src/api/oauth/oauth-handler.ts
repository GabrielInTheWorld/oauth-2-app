import express from 'express';
import qs from 'qs';
import querystring from 'querystring';
import randomstring from 'randomstring';
import request from 'sync-request';
import url from 'url';

import { Constructable } from '../../core/modules/decorators';
import { OAuthHandlerInterface } from './oauth-handler-interface';
import { Server } from '../..';

interface Client {
  clientId: string;
  clientSecret: string;
  state: string;
  scope: string;
  redirectUris: string[];
}

interface UrlOptions {
  response_type: string;
  scope?: string;
  client_id: string;
  redirect_uri: string;
  state: string;
}

interface GithubOptions extends UrlOptions {
  login?: string;
  allow_signup?: boolean;
}

@Constructable(OAuthHandlerInterface)
export class OAuthHandler implements OAuthHandlerInterface {
  public readonly name = 'OAuthHandler';

  //   private readonly githubLoginPath = 'https://github.com/login/oauth/authorize';
  private readonly githubServer = {
    authorizePath: 'https://github.com/login/oauth/authorize',
    tokenPath: 'https://github.com/login/oauth/access_token'
  };

  private readonly localServer = {
    authorizePath: 'http://localhost:9001/authorize',
    tokenPath: 'http://localhost:9001/token'
  };

  private readonly client: Client = {
    clientId: 'b23d89d084a693d4a60d',
    clientSecret: 'bc8cca6314034743710659605d031bb970a027ca',
    scope: '',
    redirectUris: ['http://localhost:8000/callback', 'https://oauth-2-app.herokuapp.com/callback'],
    // redirectUris: ['https://oauth-2-app.herokuapp.com/callback'],
    state: ''
  };

  private readonly localClient: Client = {
    clientId: 'oauth-client-1',
    clientSecret: 'oauth-client-secret-1',
    redirectUris: ['http://localhost:8000/callback'],
    scope: 'foo',
    state: ''
  };

  private accessToken = '';
  private refreshToken = '';

  public async authorize(req: express.Request, response: express.Response): Promise<void> {
    this.accessToken = '';
    this.refreshToken = '';
    this.client.state = randomstring.generate();

    // const authorizeUrl = this.buildURL(this.githubServer.authorizePath, {
    //   client_id: this.client.clientId,
    //   scope: this.client.scope,
    //   redirect_uri: Server.PORT === 8000 ? this.client.redirectUris[0] : this.client.redirectUris[1],
    //   state: this.client.state,
    //   response_type: 'code'
    // });

    const authorizeUrl = this.buildURL(this.localServer.authorizePath, this.getOptions(this.localClient));
    // const authorizeUrl = this.buildURL(this.githubServer.authorizePath, this.getOptions(this.client));

    console.log('authorizeUrl', authorizeUrl);
    response.redirect(authorizeUrl);
    // response.send({
    //     success: true,
    //     message: 'Call received'
    // });
  }

  public async callback(req: express.Request, response: express.Response): Promise<void> {
    console.log('received callback', req.query, req.body);
    if (req.query.error) {
      response.send({ success: false, error: req.query.error });
      return;
    }

    if (req.query.state !== this.client.state) {
      response.send({ success: false, error: 'State value did not match' });
      return;
    }

    const code = req.query.code;
    const formData = qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: Server.PORT === 8000 ? this.client.redirectUris[0] : this.client.redirectUris[1]
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${this.encodeClienCredentials(this.client.clientId, this.client.clientSecret)}`
    };

    const tokenResult = request('POST', this.githubServer.tokenPath, {
      body: formData,
      headers
    });

    if (tokenResult.statusCode >= 200 && tokenResult.statusCode < 300) {
      const body = this.getBodyAsObject(tokenResult.getBody());
      console.log('get answer 200:', body);
      this.accessToken = body.access_token;
      if (body.refresh_token) {
        this.refreshToken = body.refresh_token;
      }

      this.client.scope = body.scope;

      response.send({
        accessToken: this.accessToken,
        scope: this.client.scope,
        refreshToken: this.refreshToken
      });
    } else {
      response.send({
        success: false,
        error: `Unable to fetch access token, server response: ${tokenResult.statusCode}`
      });
    }
  }

  private buildURL(path: string, options: UrlOptions, hash?: string): string {
    const newUrl = url.parse(path, true);
    delete newUrl.search;
    if (!newUrl.query) {
      newUrl.query = {};
    }
    for (const key in options) {
      newUrl.query[key] = (options as any)[key];
    }
    if (hash) {
      newUrl.hash = hash;
    }
    return url.format(newUrl);
  }

  private getOptions(clientObject: Client): UrlOptions {
    return {
      client_id: clientObject.clientId,
      scope: clientObject.scope,
      //   redirect_uri: Server.PORT === 8000 ? this.client.redirectUris[0] : this.client.redirectUris[1],
      redirect_uri: clientObject.redirectUris[0],
      state: clientObject.state,
      response_type: 'code'
    };
  }

  private encodeClienCredentials(clientId: string, clientSecret: string): string {
    return Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64');
  }

  private getBodyAsObject(body: string | Buffer): { access_token: string; refresh_token?: string; [key: string]: any } {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    return body as any;
  }
}
