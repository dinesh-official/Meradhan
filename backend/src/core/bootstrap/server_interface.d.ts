export interface IServer {
    start(cb?: () => void): void;
}

export interface IExpressRoute {
    addRoutes(route: Router[]): void;
    addMiddlewares(m: express.RequestHandler[]): void;
}