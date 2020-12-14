import express from 'express';

export abstract class OAuthHandler {
  public static readonly TOKEN_ISSUER = 'OpenSlides_OAuth';

  public abstract authorize: (request: express.Request, response: express.Response) => Promise<void>;
  public abstract approve: (request: express.Request, response: express.Response) => Promise<void>;
  public abstract generateToken: (request: express.Request, response: express.Response) => Promise<void>;
  public abstract register: (request: express.Request, response: express.Response) => Promise<void>;
  public abstract refresh: (request: express.Request, response: express.Response) => Promise<void>;
  public abstract greeting: (request: express.Request, response: express.Response) => void;
}
