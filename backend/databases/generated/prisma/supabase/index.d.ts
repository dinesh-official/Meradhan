
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CRMUserDataModel
 * 
 */
export type CRMUserDataModel = $Result.DefaultSelection<Prisma.$CRMUserDataModelPayload>
/**
 * Model CustomersAuthDataModel
 * Stores authentication and account-related data for customers
 */
export type CustomersAuthDataModel = $Result.DefaultSelection<Prisma.$CustomersAuthDataModelPayload>
/**
 * Model CustomerProfileDataModel
 * Stores customer profile information (public / account details)
 */
export type CustomerProfileDataModel = $Result.DefaultSelection<Prisma.$CustomerProfileDataModelPayload>
/**
 * Model CustomerPersonalInfoModel
 * Stores customer's personal information and identity documents
 */
export type CustomerPersonalInfoModel = $Result.DefaultSelection<Prisma.$CustomerPersonalInfoModelPayload>
/**
 * Model AADHAARCardModel
 * Aadhaar card (identity proof) data model
 */
export type AADHAARCardModel = $Result.DefaultSelection<Prisma.$AADHAARCardModelPayload>
/**
 * Model PanCardModel
 * PAN card (tax identity proof) data model
 */
export type PanCardModel = $Result.DefaultSelection<Prisma.$PanCardModelPayload>
/**
 * Model CustomersBankAccountModel
 * Bank account information linked to a customer
 */
export type CustomersBankAccountModel = $Result.DefaultSelection<Prisma.$CustomersBankAccountModelPayload>
/**
 * Model CustomersDematAccountModel
 * Demat / Broker account data (for trading accounts)
 */
export type CustomersDematAccountModel = $Result.DefaultSelection<Prisma.$CustomersDematAccountModelPayload>
/**
 * Model CustomersRiskProfileModel
 * Risk profile of a customer (e.g., low / medium / high risk)
 */
export type CustomersRiskProfileModel = $Result.DefaultSelection<Prisma.$CustomersRiskProfileModelPayload>
/**
 * Model AddressModel
 * Address model (used for both current and permanent addresses)
 */
export type AddressModel = $Result.DefaultSelection<Prisma.$AddressModelPayload>
/**
 * Model LeadsModel
 * 
 */
export type LeadsModel = $Result.DefaultSelection<Prisma.$LeadsModelPayload>
/**
 * Model LeadFollowUpNotesModel
 * 
 */
export type LeadFollowUpNotesModel = $Result.DefaultSelection<Prisma.$LeadFollowUpNotesModelPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CrmUserROLE: {
  VIEWER: 'VIEWER',
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  SUPPORT: 'SUPPORT',
  RELATIONSHIP_MANAGER: 'RELATIONSHIP_MANAGER'
};

export type CrmUserROLE = (typeof CrmUserROLE)[keyof typeof CrmUserROLE]


export const AccountStatus: {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]


export const SIGNIN_WITH: {
  CREDENTIALS: 'CREDENTIALS',
  GOOGLE: 'GOOGLE',
  MICROSOFT: 'MICROSOFT'
};

export type SIGNIN_WITH = (typeof SIGNIN_WITH)[keyof typeof SIGNIN_WITH]


export const UserAccountType: {
  INDIVIDUAL: 'INDIVIDUAL',
  INDIVIDUAL_NRI_NRO: 'INDIVIDUAL_NRI_NRO',
  TRUST: 'TRUST',
  CORPORATE: 'CORPORATE',
  HUF: 'HUF',
  LLP: 'LLP',
  PARTNERSHIP_FIRM: 'PARTNERSHIP_FIRM'
};

export type UserAccountType = (typeof UserAccountType)[keyof typeof UserAccountType]


export const Gender: {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

export type Gender = (typeof Gender)[keyof typeof Gender]


export const DepositoryName: {
  NSDL: 'NSDL',
  CDSL: 'CDSL'
};

export type DepositoryName = (typeof DepositoryName)[keyof typeof DepositoryName]


export const DematAccountType: {
  SINGLE: 'SINGLE',
  JOINT: 'JOINT',
  HUF: 'HUF'
};

export type DematAccountType = (typeof DematAccountType)[keyof typeof DematAccountType]


export const KYCStatus: {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

export type KYCStatus = (typeof KYCStatus)[keyof typeof KYCStatus]


export const LeadSource: {
  WEBSITE: 'WEBSITE',
  REFERRAL: 'REFERRAL',
  SOCIAL: 'SOCIAL',
  ADVERTISEMENT: 'ADVERTISEMENT',
  EVENT: 'EVENT',
  COLD_CALL: 'COLD_CALL',
  EMAIL: 'EMAIL',
  OTHER: 'OTHER'
};

export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource]


export const LeadStatus: {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  CONVERTED: 'CONVERTED'
};

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus]


export const BondType: {
  GOVERNMENT: 'GOVERNMENT',
  CORPORATE: 'CORPORATE',
  TAX_FREE: 'TAX_FREE',
  SOVEREIGN_GOLD_BOND: 'SOVEREIGN_GOLD_BOND',
  PSU: 'PSU',
  OTHER: 'OTHER'
};

export type BondType = (typeof BondType)[keyof typeof BondType]

}

export type CrmUserROLE = $Enums.CrmUserROLE

export const CrmUserROLE: typeof $Enums.CrmUserROLE

export type AccountStatus = $Enums.AccountStatus

export const AccountStatus: typeof $Enums.AccountStatus

export type SIGNIN_WITH = $Enums.SIGNIN_WITH

export const SIGNIN_WITH: typeof $Enums.SIGNIN_WITH

export type UserAccountType = $Enums.UserAccountType

export const UserAccountType: typeof $Enums.UserAccountType

export type Gender = $Enums.Gender

export const Gender: typeof $Enums.Gender

export type DepositoryName = $Enums.DepositoryName

export const DepositoryName: typeof $Enums.DepositoryName

export type DematAccountType = $Enums.DematAccountType

export const DematAccountType: typeof $Enums.DematAccountType

export type KYCStatus = $Enums.KYCStatus

export const KYCStatus: typeof $Enums.KYCStatus

export type LeadSource = $Enums.LeadSource

export const LeadSource: typeof $Enums.LeadSource

export type LeadStatus = $Enums.LeadStatus

export const LeadStatus: typeof $Enums.LeadStatus

export type BondType = $Enums.BondType

export const BondType: typeof $Enums.BondType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CRMUserDataModels
 * const cRMUserDataModels = await prisma.cRMUserDataModel.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CRMUserDataModels
   * const cRMUserDataModels = await prisma.cRMUserDataModel.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.cRMUserDataModel`: Exposes CRUD operations for the **CRMUserDataModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CRMUserDataModels
    * const cRMUserDataModels = await prisma.cRMUserDataModel.findMany()
    * ```
    */
  get cRMUserDataModel(): Prisma.CRMUserDataModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customersAuthDataModel`: Exposes CRUD operations for the **CustomersAuthDataModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomersAuthDataModels
    * const customersAuthDataModels = await prisma.customersAuthDataModel.findMany()
    * ```
    */
  get customersAuthDataModel(): Prisma.CustomersAuthDataModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customerProfileDataModel`: Exposes CRUD operations for the **CustomerProfileDataModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomerProfileDataModels
    * const customerProfileDataModels = await prisma.customerProfileDataModel.findMany()
    * ```
    */
  get customerProfileDataModel(): Prisma.CustomerProfileDataModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customerPersonalInfoModel`: Exposes CRUD operations for the **CustomerPersonalInfoModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomerPersonalInfoModels
    * const customerPersonalInfoModels = await prisma.customerPersonalInfoModel.findMany()
    * ```
    */
  get customerPersonalInfoModel(): Prisma.CustomerPersonalInfoModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aADHAARCardModel`: Exposes CRUD operations for the **AADHAARCardModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AADHAARCardModels
    * const aADHAARCardModels = await prisma.aADHAARCardModel.findMany()
    * ```
    */
  get aADHAARCardModel(): Prisma.AADHAARCardModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.panCardModel`: Exposes CRUD operations for the **PanCardModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PanCardModels
    * const panCardModels = await prisma.panCardModel.findMany()
    * ```
    */
  get panCardModel(): Prisma.PanCardModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customersBankAccountModel`: Exposes CRUD operations for the **CustomersBankAccountModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomersBankAccountModels
    * const customersBankAccountModels = await prisma.customersBankAccountModel.findMany()
    * ```
    */
  get customersBankAccountModel(): Prisma.CustomersBankAccountModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customersDematAccountModel`: Exposes CRUD operations for the **CustomersDematAccountModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomersDematAccountModels
    * const customersDematAccountModels = await prisma.customersDematAccountModel.findMany()
    * ```
    */
  get customersDematAccountModel(): Prisma.CustomersDematAccountModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customersRiskProfileModel`: Exposes CRUD operations for the **CustomersRiskProfileModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustomersRiskProfileModels
    * const customersRiskProfileModels = await prisma.customersRiskProfileModel.findMany()
    * ```
    */
  get customersRiskProfileModel(): Prisma.CustomersRiskProfileModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.addressModel`: Exposes CRUD operations for the **AddressModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AddressModels
    * const addressModels = await prisma.addressModel.findMany()
    * ```
    */
  get addressModel(): Prisma.AddressModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.leadsModel`: Exposes CRUD operations for the **LeadsModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LeadsModels
    * const leadsModels = await prisma.leadsModel.findMany()
    * ```
    */
  get leadsModel(): Prisma.LeadsModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.leadFollowUpNotesModel`: Exposes CRUD operations for the **LeadFollowUpNotesModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LeadFollowUpNotesModels
    * const leadFollowUpNotesModels = await prisma.leadFollowUpNotesModel.findMany()
    * ```
    */
  get leadFollowUpNotesModel(): Prisma.LeadFollowUpNotesModelDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.3
   * Query Engine version: bb420e667c1820a8c05a38023385f6cc7ef8e83a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CRMUserDataModel: 'CRMUserDataModel',
    CustomersAuthDataModel: 'CustomersAuthDataModel',
    CustomerProfileDataModel: 'CustomerProfileDataModel',
    CustomerPersonalInfoModel: 'CustomerPersonalInfoModel',
    AADHAARCardModel: 'AADHAARCardModel',
    PanCardModel: 'PanCardModel',
    CustomersBankAccountModel: 'CustomersBankAccountModel',
    CustomersDematAccountModel: 'CustomersDematAccountModel',
    CustomersRiskProfileModel: 'CustomersRiskProfileModel',
    AddressModel: 'AddressModel',
    LeadsModel: 'LeadsModel',
    LeadFollowUpNotesModel: 'LeadFollowUpNotesModel'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "cRMUserDataModel" | "customersAuthDataModel" | "customerProfileDataModel" | "customerPersonalInfoModel" | "aADHAARCardModel" | "panCardModel" | "customersBankAccountModel" | "customersDematAccountModel" | "customersRiskProfileModel" | "addressModel" | "leadsModel" | "leadFollowUpNotesModel"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CRMUserDataModel: {
        payload: Prisma.$CRMUserDataModelPayload<ExtArgs>
        fields: Prisma.CRMUserDataModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CRMUserDataModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CRMUserDataModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          findFirst: {
            args: Prisma.CRMUserDataModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CRMUserDataModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          findMany: {
            args: Prisma.CRMUserDataModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>[]
          }
          create: {
            args: Prisma.CRMUserDataModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          createMany: {
            args: Prisma.CRMUserDataModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CRMUserDataModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>[]
          }
          delete: {
            args: Prisma.CRMUserDataModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          update: {
            args: Prisma.CRMUserDataModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          deleteMany: {
            args: Prisma.CRMUserDataModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CRMUserDataModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CRMUserDataModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>[]
          }
          upsert: {
            args: Prisma.CRMUserDataModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CRMUserDataModelPayload>
          }
          aggregate: {
            args: Prisma.CRMUserDataModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCRMUserDataModel>
          }
          groupBy: {
            args: Prisma.CRMUserDataModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CRMUserDataModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CRMUserDataModelCountArgs<ExtArgs>
            result: $Utils.Optional<CRMUserDataModelCountAggregateOutputType> | number
          }
        }
      }
      CustomersAuthDataModel: {
        payload: Prisma.$CustomersAuthDataModelPayload<ExtArgs>
        fields: Prisma.CustomersAuthDataModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomersAuthDataModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomersAuthDataModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          findFirst: {
            args: Prisma.CustomersAuthDataModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomersAuthDataModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          findMany: {
            args: Prisma.CustomersAuthDataModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>[]
          }
          create: {
            args: Prisma.CustomersAuthDataModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          createMany: {
            args: Prisma.CustomersAuthDataModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomersAuthDataModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>[]
          }
          delete: {
            args: Prisma.CustomersAuthDataModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          update: {
            args: Prisma.CustomersAuthDataModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomersAuthDataModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomersAuthDataModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomersAuthDataModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomersAuthDataModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersAuthDataModelPayload>
          }
          aggregate: {
            args: Prisma.CustomersAuthDataModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomersAuthDataModel>
          }
          groupBy: {
            args: Prisma.CustomersAuthDataModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomersAuthDataModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomersAuthDataModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomersAuthDataModelCountAggregateOutputType> | number
          }
        }
      }
      CustomerProfileDataModel: {
        payload: Prisma.$CustomerProfileDataModelPayload<ExtArgs>
        fields: Prisma.CustomerProfileDataModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerProfileDataModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerProfileDataModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          findFirst: {
            args: Prisma.CustomerProfileDataModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerProfileDataModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          findMany: {
            args: Prisma.CustomerProfileDataModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>[]
          }
          create: {
            args: Prisma.CustomerProfileDataModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          createMany: {
            args: Prisma.CustomerProfileDataModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerProfileDataModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>[]
          }
          delete: {
            args: Prisma.CustomerProfileDataModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          update: {
            args: Prisma.CustomerProfileDataModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomerProfileDataModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerProfileDataModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomerProfileDataModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomerProfileDataModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerProfileDataModelPayload>
          }
          aggregate: {
            args: Prisma.CustomerProfileDataModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomerProfileDataModel>
          }
          groupBy: {
            args: Prisma.CustomerProfileDataModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerProfileDataModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerProfileDataModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerProfileDataModelCountAggregateOutputType> | number
          }
        }
      }
      CustomerPersonalInfoModel: {
        payload: Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>
        fields: Prisma.CustomerPersonalInfoModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerPersonalInfoModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerPersonalInfoModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          findFirst: {
            args: Prisma.CustomerPersonalInfoModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerPersonalInfoModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          findMany: {
            args: Prisma.CustomerPersonalInfoModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>[]
          }
          create: {
            args: Prisma.CustomerPersonalInfoModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          createMany: {
            args: Prisma.CustomerPersonalInfoModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerPersonalInfoModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>[]
          }
          delete: {
            args: Prisma.CustomerPersonalInfoModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          update: {
            args: Prisma.CustomerPersonalInfoModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomerPersonalInfoModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerPersonalInfoModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomerPersonalInfoModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomerPersonalInfoModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPersonalInfoModelPayload>
          }
          aggregate: {
            args: Prisma.CustomerPersonalInfoModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomerPersonalInfoModel>
          }
          groupBy: {
            args: Prisma.CustomerPersonalInfoModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerPersonalInfoModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerPersonalInfoModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerPersonalInfoModelCountAggregateOutputType> | number
          }
        }
      }
      AADHAARCardModel: {
        payload: Prisma.$AADHAARCardModelPayload<ExtArgs>
        fields: Prisma.AADHAARCardModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AADHAARCardModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AADHAARCardModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          findFirst: {
            args: Prisma.AADHAARCardModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AADHAARCardModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          findMany: {
            args: Prisma.AADHAARCardModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>[]
          }
          create: {
            args: Prisma.AADHAARCardModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          createMany: {
            args: Prisma.AADHAARCardModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AADHAARCardModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>[]
          }
          delete: {
            args: Prisma.AADHAARCardModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          update: {
            args: Prisma.AADHAARCardModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          deleteMany: {
            args: Prisma.AADHAARCardModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AADHAARCardModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AADHAARCardModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>[]
          }
          upsert: {
            args: Prisma.AADHAARCardModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AADHAARCardModelPayload>
          }
          aggregate: {
            args: Prisma.AADHAARCardModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAADHAARCardModel>
          }
          groupBy: {
            args: Prisma.AADHAARCardModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<AADHAARCardModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.AADHAARCardModelCountArgs<ExtArgs>
            result: $Utils.Optional<AADHAARCardModelCountAggregateOutputType> | number
          }
        }
      }
      PanCardModel: {
        payload: Prisma.$PanCardModelPayload<ExtArgs>
        fields: Prisma.PanCardModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PanCardModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PanCardModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          findFirst: {
            args: Prisma.PanCardModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PanCardModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          findMany: {
            args: Prisma.PanCardModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>[]
          }
          create: {
            args: Prisma.PanCardModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          createMany: {
            args: Prisma.PanCardModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PanCardModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>[]
          }
          delete: {
            args: Prisma.PanCardModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          update: {
            args: Prisma.PanCardModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          deleteMany: {
            args: Prisma.PanCardModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PanCardModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PanCardModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>[]
          }
          upsert: {
            args: Prisma.PanCardModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PanCardModelPayload>
          }
          aggregate: {
            args: Prisma.PanCardModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePanCardModel>
          }
          groupBy: {
            args: Prisma.PanCardModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<PanCardModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.PanCardModelCountArgs<ExtArgs>
            result: $Utils.Optional<PanCardModelCountAggregateOutputType> | number
          }
        }
      }
      CustomersBankAccountModel: {
        payload: Prisma.$CustomersBankAccountModelPayload<ExtArgs>
        fields: Prisma.CustomersBankAccountModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomersBankAccountModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomersBankAccountModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          findFirst: {
            args: Prisma.CustomersBankAccountModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomersBankAccountModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          findMany: {
            args: Prisma.CustomersBankAccountModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>[]
          }
          create: {
            args: Prisma.CustomersBankAccountModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          createMany: {
            args: Prisma.CustomersBankAccountModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomersBankAccountModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>[]
          }
          delete: {
            args: Prisma.CustomersBankAccountModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          update: {
            args: Prisma.CustomersBankAccountModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomersBankAccountModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomersBankAccountModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomersBankAccountModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomersBankAccountModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersBankAccountModelPayload>
          }
          aggregate: {
            args: Prisma.CustomersBankAccountModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomersBankAccountModel>
          }
          groupBy: {
            args: Prisma.CustomersBankAccountModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomersBankAccountModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomersBankAccountModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomersBankAccountModelCountAggregateOutputType> | number
          }
        }
      }
      CustomersDematAccountModel: {
        payload: Prisma.$CustomersDematAccountModelPayload<ExtArgs>
        fields: Prisma.CustomersDematAccountModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomersDematAccountModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomersDematAccountModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          findFirst: {
            args: Prisma.CustomersDematAccountModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomersDematAccountModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          findMany: {
            args: Prisma.CustomersDematAccountModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>[]
          }
          create: {
            args: Prisma.CustomersDematAccountModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          createMany: {
            args: Prisma.CustomersDematAccountModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomersDematAccountModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>[]
          }
          delete: {
            args: Prisma.CustomersDematAccountModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          update: {
            args: Prisma.CustomersDematAccountModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomersDematAccountModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomersDematAccountModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomersDematAccountModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomersDematAccountModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersDematAccountModelPayload>
          }
          aggregate: {
            args: Prisma.CustomersDematAccountModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomersDematAccountModel>
          }
          groupBy: {
            args: Prisma.CustomersDematAccountModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomersDematAccountModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomersDematAccountModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomersDematAccountModelCountAggregateOutputType> | number
          }
        }
      }
      CustomersRiskProfileModel: {
        payload: Prisma.$CustomersRiskProfileModelPayload<ExtArgs>
        fields: Prisma.CustomersRiskProfileModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomersRiskProfileModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomersRiskProfileModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          findFirst: {
            args: Prisma.CustomersRiskProfileModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomersRiskProfileModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          findMany: {
            args: Prisma.CustomersRiskProfileModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>[]
          }
          create: {
            args: Prisma.CustomersRiskProfileModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          createMany: {
            args: Prisma.CustomersRiskProfileModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomersRiskProfileModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>[]
          }
          delete: {
            args: Prisma.CustomersRiskProfileModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          update: {
            args: Prisma.CustomersRiskProfileModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          deleteMany: {
            args: Prisma.CustomersRiskProfileModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomersRiskProfileModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomersRiskProfileModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>[]
          }
          upsert: {
            args: Prisma.CustomersRiskProfileModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomersRiskProfileModelPayload>
          }
          aggregate: {
            args: Prisma.CustomersRiskProfileModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomersRiskProfileModel>
          }
          groupBy: {
            args: Prisma.CustomersRiskProfileModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomersRiskProfileModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomersRiskProfileModelCountArgs<ExtArgs>
            result: $Utils.Optional<CustomersRiskProfileModelCountAggregateOutputType> | number
          }
        }
      }
      AddressModel: {
        payload: Prisma.$AddressModelPayload<ExtArgs>
        fields: Prisma.AddressModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AddressModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AddressModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          findFirst: {
            args: Prisma.AddressModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AddressModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          findMany: {
            args: Prisma.AddressModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>[]
          }
          create: {
            args: Prisma.AddressModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          createMany: {
            args: Prisma.AddressModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AddressModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>[]
          }
          delete: {
            args: Prisma.AddressModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          update: {
            args: Prisma.AddressModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          deleteMany: {
            args: Prisma.AddressModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AddressModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AddressModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>[]
          }
          upsert: {
            args: Prisma.AddressModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AddressModelPayload>
          }
          aggregate: {
            args: Prisma.AddressModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAddressModel>
          }
          groupBy: {
            args: Prisma.AddressModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<AddressModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.AddressModelCountArgs<ExtArgs>
            result: $Utils.Optional<AddressModelCountAggregateOutputType> | number
          }
        }
      }
      LeadsModel: {
        payload: Prisma.$LeadsModelPayload<ExtArgs>
        fields: Prisma.LeadsModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeadsModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeadsModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          findFirst: {
            args: Prisma.LeadsModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeadsModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          findMany: {
            args: Prisma.LeadsModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>[]
          }
          create: {
            args: Prisma.LeadsModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          createMany: {
            args: Prisma.LeadsModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeadsModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>[]
          }
          delete: {
            args: Prisma.LeadsModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          update: {
            args: Prisma.LeadsModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          deleteMany: {
            args: Prisma.LeadsModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeadsModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LeadsModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>[]
          }
          upsert: {
            args: Prisma.LeadsModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadsModelPayload>
          }
          aggregate: {
            args: Prisma.LeadsModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeadsModel>
          }
          groupBy: {
            args: Prisma.LeadsModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeadsModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeadsModelCountArgs<ExtArgs>
            result: $Utils.Optional<LeadsModelCountAggregateOutputType> | number
          }
        }
      }
      LeadFollowUpNotesModel: {
        payload: Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>
        fields: Prisma.LeadFollowUpNotesModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeadFollowUpNotesModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeadFollowUpNotesModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          findFirst: {
            args: Prisma.LeadFollowUpNotesModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeadFollowUpNotesModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          findMany: {
            args: Prisma.LeadFollowUpNotesModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>[]
          }
          create: {
            args: Prisma.LeadFollowUpNotesModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          createMany: {
            args: Prisma.LeadFollowUpNotesModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeadFollowUpNotesModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>[]
          }
          delete: {
            args: Prisma.LeadFollowUpNotesModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          update: {
            args: Prisma.LeadFollowUpNotesModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          deleteMany: {
            args: Prisma.LeadFollowUpNotesModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeadFollowUpNotesModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LeadFollowUpNotesModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>[]
          }
          upsert: {
            args: Prisma.LeadFollowUpNotesModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadFollowUpNotesModelPayload>
          }
          aggregate: {
            args: Prisma.LeadFollowUpNotesModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeadFollowUpNotesModel>
          }
          groupBy: {
            args: Prisma.LeadFollowUpNotesModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeadFollowUpNotesModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeadFollowUpNotesModelCountArgs<ExtArgs>
            result: $Utils.Optional<LeadFollowUpNotesModelCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    cRMUserDataModel?: CRMUserDataModelOmit
    customersAuthDataModel?: CustomersAuthDataModelOmit
    customerProfileDataModel?: CustomerProfileDataModelOmit
    customerPersonalInfoModel?: CustomerPersonalInfoModelOmit
    aADHAARCardModel?: AADHAARCardModelOmit
    panCardModel?: PanCardModelOmit
    customersBankAccountModel?: CustomersBankAccountModelOmit
    customersDematAccountModel?: CustomersDematAccountModelOmit
    customersRiskProfileModel?: CustomersRiskProfileModelOmit
    addressModel?: AddressModelOmit
    leadsModel?: LeadsModelOmit
    leadFollowUpNotesModel?: LeadFollowUpNotesModelOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CustomersAuthDataModelCountOutputType
   */

  export type CustomersAuthDataModelCountOutputType = {
    CustomerProfileDataModel: number
  }

  export type CustomersAuthDataModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersAuthDataModelCountOutputTypeCountCustomerProfileDataModelArgs
  }

  // Custom InputTypes
  /**
   * CustomersAuthDataModelCountOutputType without action
   */
  export type CustomersAuthDataModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModelCountOutputType
     */
    select?: CustomersAuthDataModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomersAuthDataModelCountOutputType without action
   */
  export type CustomersAuthDataModelCountOutputTypeCountCustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }


  /**
   * Count Type CustomerProfileDataModelCountOutputType
   */

  export type CustomerProfileDataModelCountOutputType = {
    bankAccounts: number
    dematAccounts: number
  }

  export type CustomerProfileDataModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bankAccounts?: boolean | CustomerProfileDataModelCountOutputTypeCountBankAccountsArgs
    dematAccounts?: boolean | CustomerProfileDataModelCountOutputTypeCountDematAccountsArgs
  }

  // Custom InputTypes
  /**
   * CustomerProfileDataModelCountOutputType without action
   */
  export type CustomerProfileDataModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModelCountOutputType
     */
    select?: CustomerProfileDataModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerProfileDataModelCountOutputType without action
   */
  export type CustomerProfileDataModelCountOutputTypeCountBankAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersBankAccountModelWhereInput
  }

  /**
   * CustomerProfileDataModelCountOutputType without action
   */
  export type CustomerProfileDataModelCountOutputTypeCountDematAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersDematAccountModelWhereInput
  }


  /**
   * Count Type CustomerPersonalInfoModelCountOutputType
   */

  export type CustomerPersonalInfoModelCountOutputType = {
    CustomerProfileDataModel: number
  }

  export type CustomerPersonalInfoModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomerPersonalInfoModelCountOutputTypeCountCustomerProfileDataModelArgs
  }

  // Custom InputTypes
  /**
   * CustomerPersonalInfoModelCountOutputType without action
   */
  export type CustomerPersonalInfoModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModelCountOutputType
     */
    select?: CustomerPersonalInfoModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerPersonalInfoModelCountOutputType without action
   */
  export type CustomerPersonalInfoModelCountOutputTypeCountCustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }


  /**
   * Count Type AADHAARCardModelCountOutputType
   */

  export type AADHAARCardModelCountOutputType = {
    CustomerProfileDataModel: number
  }

  export type AADHAARCardModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | AADHAARCardModelCountOutputTypeCountCustomerProfileDataModelArgs
  }

  // Custom InputTypes
  /**
   * AADHAARCardModelCountOutputType without action
   */
  export type AADHAARCardModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModelCountOutputType
     */
    select?: AADHAARCardModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AADHAARCardModelCountOutputType without action
   */
  export type AADHAARCardModelCountOutputTypeCountCustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }


  /**
   * Count Type PanCardModelCountOutputType
   */

  export type PanCardModelCountOutputType = {
    CustomerProfileDataModel: number
  }

  export type PanCardModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | PanCardModelCountOutputTypeCountCustomerProfileDataModelArgs
  }

  // Custom InputTypes
  /**
   * PanCardModelCountOutputType without action
   */
  export type PanCardModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModelCountOutputType
     */
    select?: PanCardModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PanCardModelCountOutputType without action
   */
  export type PanCardModelCountOutputTypeCountCustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }


  /**
   * Count Type AddressModelCountOutputType
   */

  export type AddressModelCountOutputType = {
    currentAddressOf: number
    permanentAddressOf: number
  }

  export type AddressModelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    currentAddressOf?: boolean | AddressModelCountOutputTypeCountCurrentAddressOfArgs
    permanentAddressOf?: boolean | AddressModelCountOutputTypeCountPermanentAddressOfArgs
  }

  // Custom InputTypes
  /**
   * AddressModelCountOutputType without action
   */
  export type AddressModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModelCountOutputType
     */
    select?: AddressModelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AddressModelCountOutputType without action
   */
  export type AddressModelCountOutputTypeCountCurrentAddressOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }

  /**
   * AddressModelCountOutputType without action
   */
  export type AddressModelCountOutputTypeCountPermanentAddressOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CRMUserDataModel
   */

  export type AggregateCRMUserDataModel = {
    _count: CRMUserDataModelCountAggregateOutputType | null
    _avg: CRMUserDataModelAvgAggregateOutputType | null
    _sum: CRMUserDataModelSumAggregateOutputType | null
    _min: CRMUserDataModelMinAggregateOutputType | null
    _max: CRMUserDataModelMaxAggregateOutputType | null
  }

  export type CRMUserDataModelAvgAggregateOutputType = {
    id: number | null
    createdBy: number | null
  }

  export type CRMUserDataModelSumAggregateOutputType = {
    id: number | null
    createdBy: number | null
  }

  export type CRMUserDataModelMinAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    phoneNo: string | null
    avatar: string | null
    lastLogin: Date | null
    role: $Enums.CrmUserROLE | null
    accountStatus: $Enums.AccountStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: number | null
  }

  export type CRMUserDataModelMaxAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    phoneNo: string | null
    avatar: string | null
    lastLogin: Date | null
    role: $Enums.CrmUserROLE | null
    accountStatus: $Enums.AccountStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: number | null
  }

  export type CRMUserDataModelCountAggregateOutputType = {
    id: number
    name: number
    email: number
    phoneNo: number
    avatar: number
    lastLogin: number
    role: number
    accountStatus: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type CRMUserDataModelAvgAggregateInputType = {
    id?: true
    createdBy?: true
  }

  export type CRMUserDataModelSumAggregateInputType = {
    id?: true
    createdBy?: true
  }

  export type CRMUserDataModelMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phoneNo?: true
    avatar?: true
    lastLogin?: true
    role?: true
    accountStatus?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type CRMUserDataModelMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phoneNo?: true
    avatar?: true
    lastLogin?: true
    role?: true
    accountStatus?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type CRMUserDataModelCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    phoneNo?: true
    avatar?: true
    lastLogin?: true
    role?: true
    accountStatus?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type CRMUserDataModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CRMUserDataModel to aggregate.
     */
    where?: CRMUserDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CRMUserDataModels to fetch.
     */
    orderBy?: CRMUserDataModelOrderByWithRelationInput | CRMUserDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CRMUserDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CRMUserDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CRMUserDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CRMUserDataModels
    **/
    _count?: true | CRMUserDataModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CRMUserDataModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CRMUserDataModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CRMUserDataModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CRMUserDataModelMaxAggregateInputType
  }

  export type GetCRMUserDataModelAggregateType<T extends CRMUserDataModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCRMUserDataModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCRMUserDataModel[P]>
      : GetScalarType<T[P], AggregateCRMUserDataModel[P]>
  }




  export type CRMUserDataModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CRMUserDataModelWhereInput
    orderBy?: CRMUserDataModelOrderByWithAggregationInput | CRMUserDataModelOrderByWithAggregationInput[]
    by: CRMUserDataModelScalarFieldEnum[] | CRMUserDataModelScalarFieldEnum
    having?: CRMUserDataModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CRMUserDataModelCountAggregateInputType | true
    _avg?: CRMUserDataModelAvgAggregateInputType
    _sum?: CRMUserDataModelSumAggregateInputType
    _min?: CRMUserDataModelMinAggregateInputType
    _max?: CRMUserDataModelMaxAggregateInputType
  }

  export type CRMUserDataModelGroupByOutputType = {
    id: number
    name: string
    email: string
    phoneNo: string
    avatar: string | null
    lastLogin: Date | null
    role: $Enums.CrmUserROLE
    accountStatus: $Enums.AccountStatus
    createdAt: Date
    updatedAt: Date
    createdBy: number | null
    _count: CRMUserDataModelCountAggregateOutputType | null
    _avg: CRMUserDataModelAvgAggregateOutputType | null
    _sum: CRMUserDataModelSumAggregateOutputType | null
    _min: CRMUserDataModelMinAggregateOutputType | null
    _max: CRMUserDataModelMaxAggregateOutputType | null
  }

  type GetCRMUserDataModelGroupByPayload<T extends CRMUserDataModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CRMUserDataModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CRMUserDataModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CRMUserDataModelGroupByOutputType[P]>
            : GetScalarType<T[P], CRMUserDataModelGroupByOutputType[P]>
        }
      >
    >


  export type CRMUserDataModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phoneNo?: boolean
    avatar?: boolean
    lastLogin?: boolean
    role?: boolean
    accountStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["cRMUserDataModel"]>

  export type CRMUserDataModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phoneNo?: boolean
    avatar?: boolean
    lastLogin?: boolean
    role?: boolean
    accountStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["cRMUserDataModel"]>

  export type CRMUserDataModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    phoneNo?: boolean
    avatar?: boolean
    lastLogin?: boolean
    role?: boolean
    accountStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["cRMUserDataModel"]>

  export type CRMUserDataModelSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    phoneNo?: boolean
    avatar?: boolean
    lastLogin?: boolean
    role?: boolean
    accountStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type CRMUserDataModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "phoneNo" | "avatar" | "lastLogin" | "role" | "accountStatus" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["cRMUserDataModel"]>

  export type $CRMUserDataModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CRMUserDataModel"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      email: string
      phoneNo: string
      avatar: string | null
      lastLogin: Date | null
      role: $Enums.CrmUserROLE
      accountStatus: $Enums.AccountStatus
      createdAt: Date
      updatedAt: Date
      createdBy: number | null
    }, ExtArgs["result"]["cRMUserDataModel"]>
    composites: {}
  }

  type CRMUserDataModelGetPayload<S extends boolean | null | undefined | CRMUserDataModelDefaultArgs> = $Result.GetResult<Prisma.$CRMUserDataModelPayload, S>

  type CRMUserDataModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CRMUserDataModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CRMUserDataModelCountAggregateInputType | true
    }

  export interface CRMUserDataModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CRMUserDataModel'], meta: { name: 'CRMUserDataModel' } }
    /**
     * Find zero or one CRMUserDataModel that matches the filter.
     * @param {CRMUserDataModelFindUniqueArgs} args - Arguments to find a CRMUserDataModel
     * @example
     * // Get one CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CRMUserDataModelFindUniqueArgs>(args: SelectSubset<T, CRMUserDataModelFindUniqueArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CRMUserDataModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CRMUserDataModelFindUniqueOrThrowArgs} args - Arguments to find a CRMUserDataModel
     * @example
     * // Get one CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CRMUserDataModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CRMUserDataModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CRMUserDataModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelFindFirstArgs} args - Arguments to find a CRMUserDataModel
     * @example
     * // Get one CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CRMUserDataModelFindFirstArgs>(args?: SelectSubset<T, CRMUserDataModelFindFirstArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CRMUserDataModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelFindFirstOrThrowArgs} args - Arguments to find a CRMUserDataModel
     * @example
     * // Get one CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CRMUserDataModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CRMUserDataModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CRMUserDataModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CRMUserDataModels
     * const cRMUserDataModels = await prisma.cRMUserDataModel.findMany()
     * 
     * // Get first 10 CRMUserDataModels
     * const cRMUserDataModels = await prisma.cRMUserDataModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cRMUserDataModelWithIdOnly = await prisma.cRMUserDataModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CRMUserDataModelFindManyArgs>(args?: SelectSubset<T, CRMUserDataModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CRMUserDataModel.
     * @param {CRMUserDataModelCreateArgs} args - Arguments to create a CRMUserDataModel.
     * @example
     * // Create one CRMUserDataModel
     * const CRMUserDataModel = await prisma.cRMUserDataModel.create({
     *   data: {
     *     // ... data to create a CRMUserDataModel
     *   }
     * })
     * 
     */
    create<T extends CRMUserDataModelCreateArgs>(args: SelectSubset<T, CRMUserDataModelCreateArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CRMUserDataModels.
     * @param {CRMUserDataModelCreateManyArgs} args - Arguments to create many CRMUserDataModels.
     * @example
     * // Create many CRMUserDataModels
     * const cRMUserDataModel = await prisma.cRMUserDataModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CRMUserDataModelCreateManyArgs>(args?: SelectSubset<T, CRMUserDataModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CRMUserDataModels and returns the data saved in the database.
     * @param {CRMUserDataModelCreateManyAndReturnArgs} args - Arguments to create many CRMUserDataModels.
     * @example
     * // Create many CRMUserDataModels
     * const cRMUserDataModel = await prisma.cRMUserDataModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CRMUserDataModels and only return the `id`
     * const cRMUserDataModelWithIdOnly = await prisma.cRMUserDataModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CRMUserDataModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CRMUserDataModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CRMUserDataModel.
     * @param {CRMUserDataModelDeleteArgs} args - Arguments to delete one CRMUserDataModel.
     * @example
     * // Delete one CRMUserDataModel
     * const CRMUserDataModel = await prisma.cRMUserDataModel.delete({
     *   where: {
     *     // ... filter to delete one CRMUserDataModel
     *   }
     * })
     * 
     */
    delete<T extends CRMUserDataModelDeleteArgs>(args: SelectSubset<T, CRMUserDataModelDeleteArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CRMUserDataModel.
     * @param {CRMUserDataModelUpdateArgs} args - Arguments to update one CRMUserDataModel.
     * @example
     * // Update one CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CRMUserDataModelUpdateArgs>(args: SelectSubset<T, CRMUserDataModelUpdateArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CRMUserDataModels.
     * @param {CRMUserDataModelDeleteManyArgs} args - Arguments to filter CRMUserDataModels to delete.
     * @example
     * // Delete a few CRMUserDataModels
     * const { count } = await prisma.cRMUserDataModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CRMUserDataModelDeleteManyArgs>(args?: SelectSubset<T, CRMUserDataModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CRMUserDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CRMUserDataModels
     * const cRMUserDataModel = await prisma.cRMUserDataModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CRMUserDataModelUpdateManyArgs>(args: SelectSubset<T, CRMUserDataModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CRMUserDataModels and returns the data updated in the database.
     * @param {CRMUserDataModelUpdateManyAndReturnArgs} args - Arguments to update many CRMUserDataModels.
     * @example
     * // Update many CRMUserDataModels
     * const cRMUserDataModel = await prisma.cRMUserDataModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CRMUserDataModels and only return the `id`
     * const cRMUserDataModelWithIdOnly = await prisma.cRMUserDataModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CRMUserDataModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CRMUserDataModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CRMUserDataModel.
     * @param {CRMUserDataModelUpsertArgs} args - Arguments to update or create a CRMUserDataModel.
     * @example
     * // Update or create a CRMUserDataModel
     * const cRMUserDataModel = await prisma.cRMUserDataModel.upsert({
     *   create: {
     *     // ... data to create a CRMUserDataModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CRMUserDataModel we want to update
     *   }
     * })
     */
    upsert<T extends CRMUserDataModelUpsertArgs>(args: SelectSubset<T, CRMUserDataModelUpsertArgs<ExtArgs>>): Prisma__CRMUserDataModelClient<$Result.GetResult<Prisma.$CRMUserDataModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CRMUserDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelCountArgs} args - Arguments to filter CRMUserDataModels to count.
     * @example
     * // Count the number of CRMUserDataModels
     * const count = await prisma.cRMUserDataModel.count({
     *   where: {
     *     // ... the filter for the CRMUserDataModels we want to count
     *   }
     * })
    **/
    count<T extends CRMUserDataModelCountArgs>(
      args?: Subset<T, CRMUserDataModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CRMUserDataModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CRMUserDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CRMUserDataModelAggregateArgs>(args: Subset<T, CRMUserDataModelAggregateArgs>): Prisma.PrismaPromise<GetCRMUserDataModelAggregateType<T>>

    /**
     * Group by CRMUserDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CRMUserDataModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CRMUserDataModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CRMUserDataModelGroupByArgs['orderBy'] }
        : { orderBy?: CRMUserDataModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CRMUserDataModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCRMUserDataModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CRMUserDataModel model
   */
  readonly fields: CRMUserDataModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CRMUserDataModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CRMUserDataModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CRMUserDataModel model
   */
  interface CRMUserDataModelFieldRefs {
    readonly id: FieldRef<"CRMUserDataModel", 'Int'>
    readonly name: FieldRef<"CRMUserDataModel", 'String'>
    readonly email: FieldRef<"CRMUserDataModel", 'String'>
    readonly phoneNo: FieldRef<"CRMUserDataModel", 'String'>
    readonly avatar: FieldRef<"CRMUserDataModel", 'String'>
    readonly lastLogin: FieldRef<"CRMUserDataModel", 'DateTime'>
    readonly role: FieldRef<"CRMUserDataModel", 'CrmUserROLE'>
    readonly accountStatus: FieldRef<"CRMUserDataModel", 'AccountStatus'>
    readonly createdAt: FieldRef<"CRMUserDataModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CRMUserDataModel", 'DateTime'>
    readonly createdBy: FieldRef<"CRMUserDataModel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CRMUserDataModel findUnique
   */
  export type CRMUserDataModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter, which CRMUserDataModel to fetch.
     */
    where: CRMUserDataModelWhereUniqueInput
  }

  /**
   * CRMUserDataModel findUniqueOrThrow
   */
  export type CRMUserDataModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter, which CRMUserDataModel to fetch.
     */
    where: CRMUserDataModelWhereUniqueInput
  }

  /**
   * CRMUserDataModel findFirst
   */
  export type CRMUserDataModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter, which CRMUserDataModel to fetch.
     */
    where?: CRMUserDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CRMUserDataModels to fetch.
     */
    orderBy?: CRMUserDataModelOrderByWithRelationInput | CRMUserDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CRMUserDataModels.
     */
    cursor?: CRMUserDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CRMUserDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CRMUserDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CRMUserDataModels.
     */
    distinct?: CRMUserDataModelScalarFieldEnum | CRMUserDataModelScalarFieldEnum[]
  }

  /**
   * CRMUserDataModel findFirstOrThrow
   */
  export type CRMUserDataModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter, which CRMUserDataModel to fetch.
     */
    where?: CRMUserDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CRMUserDataModels to fetch.
     */
    orderBy?: CRMUserDataModelOrderByWithRelationInput | CRMUserDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CRMUserDataModels.
     */
    cursor?: CRMUserDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CRMUserDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CRMUserDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CRMUserDataModels.
     */
    distinct?: CRMUserDataModelScalarFieldEnum | CRMUserDataModelScalarFieldEnum[]
  }

  /**
   * CRMUserDataModel findMany
   */
  export type CRMUserDataModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter, which CRMUserDataModels to fetch.
     */
    where?: CRMUserDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CRMUserDataModels to fetch.
     */
    orderBy?: CRMUserDataModelOrderByWithRelationInput | CRMUserDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CRMUserDataModels.
     */
    cursor?: CRMUserDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CRMUserDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CRMUserDataModels.
     */
    skip?: number
    distinct?: CRMUserDataModelScalarFieldEnum | CRMUserDataModelScalarFieldEnum[]
  }

  /**
   * CRMUserDataModel create
   */
  export type CRMUserDataModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * The data needed to create a CRMUserDataModel.
     */
    data: XOR<CRMUserDataModelCreateInput, CRMUserDataModelUncheckedCreateInput>
  }

  /**
   * CRMUserDataModel createMany
   */
  export type CRMUserDataModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CRMUserDataModels.
     */
    data: CRMUserDataModelCreateManyInput | CRMUserDataModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CRMUserDataModel createManyAndReturn
   */
  export type CRMUserDataModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * The data used to create many CRMUserDataModels.
     */
    data: CRMUserDataModelCreateManyInput | CRMUserDataModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CRMUserDataModel update
   */
  export type CRMUserDataModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * The data needed to update a CRMUserDataModel.
     */
    data: XOR<CRMUserDataModelUpdateInput, CRMUserDataModelUncheckedUpdateInput>
    /**
     * Choose, which CRMUserDataModel to update.
     */
    where: CRMUserDataModelWhereUniqueInput
  }

  /**
   * CRMUserDataModel updateMany
   */
  export type CRMUserDataModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CRMUserDataModels.
     */
    data: XOR<CRMUserDataModelUpdateManyMutationInput, CRMUserDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CRMUserDataModels to update
     */
    where?: CRMUserDataModelWhereInput
    /**
     * Limit how many CRMUserDataModels to update.
     */
    limit?: number
  }

  /**
   * CRMUserDataModel updateManyAndReturn
   */
  export type CRMUserDataModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * The data used to update CRMUserDataModels.
     */
    data: XOR<CRMUserDataModelUpdateManyMutationInput, CRMUserDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CRMUserDataModels to update
     */
    where?: CRMUserDataModelWhereInput
    /**
     * Limit how many CRMUserDataModels to update.
     */
    limit?: number
  }

  /**
   * CRMUserDataModel upsert
   */
  export type CRMUserDataModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * The filter to search for the CRMUserDataModel to update in case it exists.
     */
    where: CRMUserDataModelWhereUniqueInput
    /**
     * In case the CRMUserDataModel found by the `where` argument doesn't exist, create a new CRMUserDataModel with this data.
     */
    create: XOR<CRMUserDataModelCreateInput, CRMUserDataModelUncheckedCreateInput>
    /**
     * In case the CRMUserDataModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CRMUserDataModelUpdateInput, CRMUserDataModelUncheckedUpdateInput>
  }

  /**
   * CRMUserDataModel delete
   */
  export type CRMUserDataModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
    /**
     * Filter which CRMUserDataModel to delete.
     */
    where: CRMUserDataModelWhereUniqueInput
  }

  /**
   * CRMUserDataModel deleteMany
   */
  export type CRMUserDataModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CRMUserDataModels to delete
     */
    where?: CRMUserDataModelWhereInput
    /**
     * Limit how many CRMUserDataModels to delete.
     */
    limit?: number
  }

  /**
   * CRMUserDataModel without action
   */
  export type CRMUserDataModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CRMUserDataModel
     */
    select?: CRMUserDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CRMUserDataModel
     */
    omit?: CRMUserDataModelOmit<ExtArgs> | null
  }


  /**
   * Model CustomersAuthDataModel
   */

  export type AggregateCustomersAuthDataModel = {
    _count: CustomersAuthDataModelCountAggregateOutputType | null
    _avg: CustomersAuthDataModelAvgAggregateOutputType | null
    _sum: CustomersAuthDataModelSumAggregateOutputType | null
    _min: CustomersAuthDataModelMinAggregateOutputType | null
    _max: CustomersAuthDataModelMaxAggregateOutputType | null
  }

  export type CustomersAuthDataModelAvgAggregateOutputType = {
    id: number | null
  }

  export type CustomersAuthDataModelSumAggregateOutputType = {
    id: number | null
  }

  export type CustomersAuthDataModelMinAggregateOutputType = {
    id: number | null
    password: string | null
    signinWith: $Enums.SIGNIN_WITH | null
    accountStatus: $Enums.AccountStatus | null
    isPhoneVerified: boolean | null
    isEmailVerified: boolean | null
    whatsAppNotificationAllow: boolean | null
    termsAccepted: boolean | null
    lastLogin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersAuthDataModelMaxAggregateOutputType = {
    id: number | null
    password: string | null
    signinWith: $Enums.SIGNIN_WITH | null
    accountStatus: $Enums.AccountStatus | null
    isPhoneVerified: boolean | null
    isEmailVerified: boolean | null
    whatsAppNotificationAllow: boolean | null
    termsAccepted: boolean | null
    lastLogin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersAuthDataModelCountAggregateOutputType = {
    id: number
    password: number
    signinWith: number
    accountStatus: number
    isPhoneVerified: number
    isEmailVerified: number
    whatsAppNotificationAllow: number
    termsAccepted: number
    lastLogin: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomersAuthDataModelAvgAggregateInputType = {
    id?: true
  }

  export type CustomersAuthDataModelSumAggregateInputType = {
    id?: true
  }

  export type CustomersAuthDataModelMinAggregateInputType = {
    id?: true
    password?: true
    signinWith?: true
    accountStatus?: true
    isPhoneVerified?: true
    isEmailVerified?: true
    whatsAppNotificationAllow?: true
    termsAccepted?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersAuthDataModelMaxAggregateInputType = {
    id?: true
    password?: true
    signinWith?: true
    accountStatus?: true
    isPhoneVerified?: true
    isEmailVerified?: true
    whatsAppNotificationAllow?: true
    termsAccepted?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersAuthDataModelCountAggregateInputType = {
    id?: true
    password?: true
    signinWith?: true
    accountStatus?: true
    isPhoneVerified?: true
    isEmailVerified?: true
    whatsAppNotificationAllow?: true
    termsAccepted?: true
    lastLogin?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomersAuthDataModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersAuthDataModel to aggregate.
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersAuthDataModels to fetch.
     */
    orderBy?: CustomersAuthDataModelOrderByWithRelationInput | CustomersAuthDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomersAuthDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersAuthDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersAuthDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomersAuthDataModels
    **/
    _count?: true | CustomersAuthDataModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomersAuthDataModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomersAuthDataModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomersAuthDataModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomersAuthDataModelMaxAggregateInputType
  }

  export type GetCustomersAuthDataModelAggregateType<T extends CustomersAuthDataModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomersAuthDataModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomersAuthDataModel[P]>
      : GetScalarType<T[P], AggregateCustomersAuthDataModel[P]>
  }




  export type CustomersAuthDataModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersAuthDataModelWhereInput
    orderBy?: CustomersAuthDataModelOrderByWithAggregationInput | CustomersAuthDataModelOrderByWithAggregationInput[]
    by: CustomersAuthDataModelScalarFieldEnum[] | CustomersAuthDataModelScalarFieldEnum
    having?: CustomersAuthDataModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomersAuthDataModelCountAggregateInputType | true
    _avg?: CustomersAuthDataModelAvgAggregateInputType
    _sum?: CustomersAuthDataModelSumAggregateInputType
    _min?: CustomersAuthDataModelMinAggregateInputType
    _max?: CustomersAuthDataModelMaxAggregateInputType
  }

  export type CustomersAuthDataModelGroupByOutputType = {
    id: number
    password: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus: $Enums.AccountStatus
    isPhoneVerified: boolean
    isEmailVerified: boolean
    whatsAppNotificationAllow: boolean
    termsAccepted: boolean
    lastLogin: Date | null
    createdAt: Date
    updatedAt: Date
    _count: CustomersAuthDataModelCountAggregateOutputType | null
    _avg: CustomersAuthDataModelAvgAggregateOutputType | null
    _sum: CustomersAuthDataModelSumAggregateOutputType | null
    _min: CustomersAuthDataModelMinAggregateOutputType | null
    _max: CustomersAuthDataModelMaxAggregateOutputType | null
  }

  type GetCustomersAuthDataModelGroupByPayload<T extends CustomersAuthDataModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomersAuthDataModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomersAuthDataModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomersAuthDataModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomersAuthDataModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomersAuthDataModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    password?: boolean
    signinWith?: boolean
    accountStatus?: boolean
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersAuthDataModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | CustomersAuthDataModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customersAuthDataModel"]>

  export type CustomersAuthDataModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    password?: boolean
    signinWith?: boolean
    accountStatus?: boolean
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customersAuthDataModel"]>

  export type CustomersAuthDataModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    password?: boolean
    signinWith?: boolean
    accountStatus?: boolean
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customersAuthDataModel"]>

  export type CustomersAuthDataModelSelectScalar = {
    id?: boolean
    password?: boolean
    signinWith?: boolean
    accountStatus?: boolean
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomersAuthDataModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "password" | "signinWith" | "accountStatus" | "isPhoneVerified" | "isEmailVerified" | "whatsAppNotificationAllow" | "termsAccepted" | "lastLogin" | "createdAt" | "updatedAt", ExtArgs["result"]["customersAuthDataModel"]>
  export type CustomersAuthDataModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersAuthDataModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | CustomersAuthDataModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomersAuthDataModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustomersAuthDataModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomersAuthDataModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomersAuthDataModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Encrypted password (optional if using social login)
       */
      password: string | null
      /**
       * Type of sign-in used (e.g., EMAIL, GOOGLE, etc.)
       */
      signinWith: $Enums.SIGNIN_WITH
      /**
       * Account status (e.g., ACTIVE, INACTIVE, SUSPENDED)
       */
      accountStatus: $Enums.AccountStatus
      /**
       * Verification flags
       */
      isPhoneVerified: boolean
      isEmailVerified: boolean
      whatsAppNotificationAllow: boolean
      termsAccepted: boolean
      lastLogin: Date | null
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customersAuthDataModel"]>
    composites: {}
  }

  type CustomersAuthDataModelGetPayload<S extends boolean | null | undefined | CustomersAuthDataModelDefaultArgs> = $Result.GetResult<Prisma.$CustomersAuthDataModelPayload, S>

  type CustomersAuthDataModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomersAuthDataModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomersAuthDataModelCountAggregateInputType | true
    }

  export interface CustomersAuthDataModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomersAuthDataModel'], meta: { name: 'CustomersAuthDataModel' } }
    /**
     * Find zero or one CustomersAuthDataModel that matches the filter.
     * @param {CustomersAuthDataModelFindUniqueArgs} args - Arguments to find a CustomersAuthDataModel
     * @example
     * // Get one CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomersAuthDataModelFindUniqueArgs>(args: SelectSubset<T, CustomersAuthDataModelFindUniqueArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomersAuthDataModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomersAuthDataModelFindUniqueOrThrowArgs} args - Arguments to find a CustomersAuthDataModel
     * @example
     * // Get one CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomersAuthDataModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomersAuthDataModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersAuthDataModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelFindFirstArgs} args - Arguments to find a CustomersAuthDataModel
     * @example
     * // Get one CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomersAuthDataModelFindFirstArgs>(args?: SelectSubset<T, CustomersAuthDataModelFindFirstArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersAuthDataModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelFindFirstOrThrowArgs} args - Arguments to find a CustomersAuthDataModel
     * @example
     * // Get one CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomersAuthDataModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomersAuthDataModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomersAuthDataModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomersAuthDataModels
     * const customersAuthDataModels = await prisma.customersAuthDataModel.findMany()
     * 
     * // Get first 10 CustomersAuthDataModels
     * const customersAuthDataModels = await prisma.customersAuthDataModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customersAuthDataModelWithIdOnly = await prisma.customersAuthDataModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomersAuthDataModelFindManyArgs>(args?: SelectSubset<T, CustomersAuthDataModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomersAuthDataModel.
     * @param {CustomersAuthDataModelCreateArgs} args - Arguments to create a CustomersAuthDataModel.
     * @example
     * // Create one CustomersAuthDataModel
     * const CustomersAuthDataModel = await prisma.customersAuthDataModel.create({
     *   data: {
     *     // ... data to create a CustomersAuthDataModel
     *   }
     * })
     * 
     */
    create<T extends CustomersAuthDataModelCreateArgs>(args: SelectSubset<T, CustomersAuthDataModelCreateArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomersAuthDataModels.
     * @param {CustomersAuthDataModelCreateManyArgs} args - Arguments to create many CustomersAuthDataModels.
     * @example
     * // Create many CustomersAuthDataModels
     * const customersAuthDataModel = await prisma.customersAuthDataModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomersAuthDataModelCreateManyArgs>(args?: SelectSubset<T, CustomersAuthDataModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomersAuthDataModels and returns the data saved in the database.
     * @param {CustomersAuthDataModelCreateManyAndReturnArgs} args - Arguments to create many CustomersAuthDataModels.
     * @example
     * // Create many CustomersAuthDataModels
     * const customersAuthDataModel = await prisma.customersAuthDataModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomersAuthDataModels and only return the `id`
     * const customersAuthDataModelWithIdOnly = await prisma.customersAuthDataModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomersAuthDataModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomersAuthDataModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomersAuthDataModel.
     * @param {CustomersAuthDataModelDeleteArgs} args - Arguments to delete one CustomersAuthDataModel.
     * @example
     * // Delete one CustomersAuthDataModel
     * const CustomersAuthDataModel = await prisma.customersAuthDataModel.delete({
     *   where: {
     *     // ... filter to delete one CustomersAuthDataModel
     *   }
     * })
     * 
     */
    delete<T extends CustomersAuthDataModelDeleteArgs>(args: SelectSubset<T, CustomersAuthDataModelDeleteArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomersAuthDataModel.
     * @param {CustomersAuthDataModelUpdateArgs} args - Arguments to update one CustomersAuthDataModel.
     * @example
     * // Update one CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomersAuthDataModelUpdateArgs>(args: SelectSubset<T, CustomersAuthDataModelUpdateArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomersAuthDataModels.
     * @param {CustomersAuthDataModelDeleteManyArgs} args - Arguments to filter CustomersAuthDataModels to delete.
     * @example
     * // Delete a few CustomersAuthDataModels
     * const { count } = await prisma.customersAuthDataModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomersAuthDataModelDeleteManyArgs>(args?: SelectSubset<T, CustomersAuthDataModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersAuthDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomersAuthDataModels
     * const customersAuthDataModel = await prisma.customersAuthDataModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomersAuthDataModelUpdateManyArgs>(args: SelectSubset<T, CustomersAuthDataModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersAuthDataModels and returns the data updated in the database.
     * @param {CustomersAuthDataModelUpdateManyAndReturnArgs} args - Arguments to update many CustomersAuthDataModels.
     * @example
     * // Update many CustomersAuthDataModels
     * const customersAuthDataModel = await prisma.customersAuthDataModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomersAuthDataModels and only return the `id`
     * const customersAuthDataModelWithIdOnly = await prisma.customersAuthDataModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomersAuthDataModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomersAuthDataModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomersAuthDataModel.
     * @param {CustomersAuthDataModelUpsertArgs} args - Arguments to update or create a CustomersAuthDataModel.
     * @example
     * // Update or create a CustomersAuthDataModel
     * const customersAuthDataModel = await prisma.customersAuthDataModel.upsert({
     *   create: {
     *     // ... data to create a CustomersAuthDataModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomersAuthDataModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomersAuthDataModelUpsertArgs>(args: SelectSubset<T, CustomersAuthDataModelUpsertArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomersAuthDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelCountArgs} args - Arguments to filter CustomersAuthDataModels to count.
     * @example
     * // Count the number of CustomersAuthDataModels
     * const count = await prisma.customersAuthDataModel.count({
     *   where: {
     *     // ... the filter for the CustomersAuthDataModels we want to count
     *   }
     * })
    **/
    count<T extends CustomersAuthDataModelCountArgs>(
      args?: Subset<T, CustomersAuthDataModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomersAuthDataModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomersAuthDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomersAuthDataModelAggregateArgs>(args: Subset<T, CustomersAuthDataModelAggregateArgs>): Prisma.PrismaPromise<GetCustomersAuthDataModelAggregateType<T>>

    /**
     * Group by CustomersAuthDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersAuthDataModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomersAuthDataModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomersAuthDataModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomersAuthDataModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomersAuthDataModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomersAuthDataModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomersAuthDataModel model
   */
  readonly fields: CustomersAuthDataModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomersAuthDataModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomersAuthDataModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends CustomersAuthDataModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, CustomersAuthDataModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomersAuthDataModel model
   */
  interface CustomersAuthDataModelFieldRefs {
    readonly id: FieldRef<"CustomersAuthDataModel", 'Int'>
    readonly password: FieldRef<"CustomersAuthDataModel", 'String'>
    readonly signinWith: FieldRef<"CustomersAuthDataModel", 'SIGNIN_WITH'>
    readonly accountStatus: FieldRef<"CustomersAuthDataModel", 'AccountStatus'>
    readonly isPhoneVerified: FieldRef<"CustomersAuthDataModel", 'Boolean'>
    readonly isEmailVerified: FieldRef<"CustomersAuthDataModel", 'Boolean'>
    readonly whatsAppNotificationAllow: FieldRef<"CustomersAuthDataModel", 'Boolean'>
    readonly termsAccepted: FieldRef<"CustomersAuthDataModel", 'Boolean'>
    readonly lastLogin: FieldRef<"CustomersAuthDataModel", 'DateTime'>
    readonly createdAt: FieldRef<"CustomersAuthDataModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomersAuthDataModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomersAuthDataModel findUnique
   */
  export type CustomersAuthDataModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersAuthDataModel to fetch.
     */
    where: CustomersAuthDataModelWhereUniqueInput
  }

  /**
   * CustomersAuthDataModel findUniqueOrThrow
   */
  export type CustomersAuthDataModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersAuthDataModel to fetch.
     */
    where: CustomersAuthDataModelWhereUniqueInput
  }

  /**
   * CustomersAuthDataModel findFirst
   */
  export type CustomersAuthDataModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersAuthDataModel to fetch.
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersAuthDataModels to fetch.
     */
    orderBy?: CustomersAuthDataModelOrderByWithRelationInput | CustomersAuthDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersAuthDataModels.
     */
    cursor?: CustomersAuthDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersAuthDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersAuthDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersAuthDataModels.
     */
    distinct?: CustomersAuthDataModelScalarFieldEnum | CustomersAuthDataModelScalarFieldEnum[]
  }

  /**
   * CustomersAuthDataModel findFirstOrThrow
   */
  export type CustomersAuthDataModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersAuthDataModel to fetch.
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersAuthDataModels to fetch.
     */
    orderBy?: CustomersAuthDataModelOrderByWithRelationInput | CustomersAuthDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersAuthDataModels.
     */
    cursor?: CustomersAuthDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersAuthDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersAuthDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersAuthDataModels.
     */
    distinct?: CustomersAuthDataModelScalarFieldEnum | CustomersAuthDataModelScalarFieldEnum[]
  }

  /**
   * CustomersAuthDataModel findMany
   */
  export type CustomersAuthDataModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersAuthDataModels to fetch.
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersAuthDataModels to fetch.
     */
    orderBy?: CustomersAuthDataModelOrderByWithRelationInput | CustomersAuthDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomersAuthDataModels.
     */
    cursor?: CustomersAuthDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersAuthDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersAuthDataModels.
     */
    skip?: number
    distinct?: CustomersAuthDataModelScalarFieldEnum | CustomersAuthDataModelScalarFieldEnum[]
  }

  /**
   * CustomersAuthDataModel create
   */
  export type CustomersAuthDataModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomersAuthDataModel.
     */
    data: XOR<CustomersAuthDataModelCreateInput, CustomersAuthDataModelUncheckedCreateInput>
  }

  /**
   * CustomersAuthDataModel createMany
   */
  export type CustomersAuthDataModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomersAuthDataModels.
     */
    data: CustomersAuthDataModelCreateManyInput | CustomersAuthDataModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersAuthDataModel createManyAndReturn
   */
  export type CustomersAuthDataModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomersAuthDataModels.
     */
    data: CustomersAuthDataModelCreateManyInput | CustomersAuthDataModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersAuthDataModel update
   */
  export type CustomersAuthDataModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomersAuthDataModel.
     */
    data: XOR<CustomersAuthDataModelUpdateInput, CustomersAuthDataModelUncheckedUpdateInput>
    /**
     * Choose, which CustomersAuthDataModel to update.
     */
    where: CustomersAuthDataModelWhereUniqueInput
  }

  /**
   * CustomersAuthDataModel updateMany
   */
  export type CustomersAuthDataModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomersAuthDataModels.
     */
    data: XOR<CustomersAuthDataModelUpdateManyMutationInput, CustomersAuthDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersAuthDataModels to update
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * Limit how many CustomersAuthDataModels to update.
     */
    limit?: number
  }

  /**
   * CustomersAuthDataModel updateManyAndReturn
   */
  export type CustomersAuthDataModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomersAuthDataModels.
     */
    data: XOR<CustomersAuthDataModelUpdateManyMutationInput, CustomersAuthDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersAuthDataModels to update
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * Limit how many CustomersAuthDataModels to update.
     */
    limit?: number
  }

  /**
   * CustomersAuthDataModel upsert
   */
  export type CustomersAuthDataModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomersAuthDataModel to update in case it exists.
     */
    where: CustomersAuthDataModelWhereUniqueInput
    /**
     * In case the CustomersAuthDataModel found by the `where` argument doesn't exist, create a new CustomersAuthDataModel with this data.
     */
    create: XOR<CustomersAuthDataModelCreateInput, CustomersAuthDataModelUncheckedCreateInput>
    /**
     * In case the CustomersAuthDataModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomersAuthDataModelUpdateInput, CustomersAuthDataModelUncheckedUpdateInput>
  }

  /**
   * CustomersAuthDataModel delete
   */
  export type CustomersAuthDataModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
    /**
     * Filter which CustomersAuthDataModel to delete.
     */
    where: CustomersAuthDataModelWhereUniqueInput
  }

  /**
   * CustomersAuthDataModel deleteMany
   */
  export type CustomersAuthDataModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersAuthDataModels to delete
     */
    where?: CustomersAuthDataModelWhereInput
    /**
     * Limit how many CustomersAuthDataModels to delete.
     */
    limit?: number
  }

  /**
   * CustomersAuthDataModel.CustomerProfileDataModel
   */
  export type CustomersAuthDataModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * CustomersAuthDataModel without action
   */
  export type CustomersAuthDataModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersAuthDataModel
     */
    select?: CustomersAuthDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersAuthDataModel
     */
    omit?: CustomersAuthDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersAuthDataModelInclude<ExtArgs> | null
  }


  /**
   * Model CustomerProfileDataModel
   */

  export type AggregateCustomerProfileDataModel = {
    _count: CustomerProfileDataModelCountAggregateOutputType | null
    _avg: CustomerProfileDataModelAvgAggregateOutputType | null
    _sum: CustomerProfileDataModelSumAggregateOutputType | null
    _min: CustomerProfileDataModelMinAggregateOutputType | null
    _max: CustomerProfileDataModelMaxAggregateOutputType | null
  }

  export type CustomerProfileDataModelAvgAggregateOutputType = {
    id: number | null
    VerifiedBy: number | null
    customersAuthDataModelId: number | null
    createdBy: number | null
    aADHAARCardModelId: number | null
    panCardModelId: number | null
    customerPersonalInfoModelId: number | null
    currentAddressModelId: number | null
    permanentAddressModelId: number | null
  }

  export type CustomerProfileDataModelSumAggregateOutputType = {
    id: number | null
    VerifiedBy: number | null
    customersAuthDataModelId: number | null
    createdBy: number | null
    aADHAARCardModelId: number | null
    panCardModelId: number | null
    customerPersonalInfoModelId: number | null
    currentAddressModelId: number | null
    permanentAddressModelId: number | null
  }

  export type CustomerProfileDataModelMinAggregateOutputType = {
    id: number | null
    userName: string | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    gender: $Enums.Gender | null
    emailAddress: string | null
    phoneNo: string | null
    whatsAppNo: string | null
    avatar: string | null
    userType: $Enums.UserAccountType | null
    kycStatus: $Enums.KYCStatus | null
    VerifiedBy: number | null
    customersAuthDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: number | null
    aADHAARCardModelId: number | null
    panCardModelId: number | null
    customerPersonalInfoModelId: number | null
    currentAddressModelId: number | null
    permanentAddressModelId: number | null
  }

  export type CustomerProfileDataModelMaxAggregateOutputType = {
    id: number | null
    userName: string | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    gender: $Enums.Gender | null
    emailAddress: string | null
    phoneNo: string | null
    whatsAppNo: string | null
    avatar: string | null
    userType: $Enums.UserAccountType | null
    kycStatus: $Enums.KYCStatus | null
    VerifiedBy: number | null
    customersAuthDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: number | null
    aADHAARCardModelId: number | null
    panCardModelId: number | null
    customerPersonalInfoModelId: number | null
    currentAddressModelId: number | null
    permanentAddressModelId: number | null
  }

  export type CustomerProfileDataModelCountAggregateOutputType = {
    id: number
    userName: number
    firstName: number
    middleName: number
    lastName: number
    gender: number
    emailAddress: number
    phoneNo: number
    whatsAppNo: number
    avatar: number
    userType: number
    kycStatus: number
    VerifiedBy: number
    customersAuthDataModelId: number
    createdAt: number
    updatedAt: number
    createdBy: number
    aADHAARCardModelId: number
    panCardModelId: number
    customerPersonalInfoModelId: number
    currentAddressModelId: number
    permanentAddressModelId: number
    _all: number
  }


  export type CustomerProfileDataModelAvgAggregateInputType = {
    id?: true
    VerifiedBy?: true
    customersAuthDataModelId?: true
    createdBy?: true
    aADHAARCardModelId?: true
    panCardModelId?: true
    customerPersonalInfoModelId?: true
    currentAddressModelId?: true
    permanentAddressModelId?: true
  }

  export type CustomerProfileDataModelSumAggregateInputType = {
    id?: true
    VerifiedBy?: true
    customersAuthDataModelId?: true
    createdBy?: true
    aADHAARCardModelId?: true
    panCardModelId?: true
    customerPersonalInfoModelId?: true
    currentAddressModelId?: true
    permanentAddressModelId?: true
  }

  export type CustomerProfileDataModelMinAggregateInputType = {
    id?: true
    userName?: true
    firstName?: true
    middleName?: true
    lastName?: true
    gender?: true
    emailAddress?: true
    phoneNo?: true
    whatsAppNo?: true
    avatar?: true
    userType?: true
    kycStatus?: true
    VerifiedBy?: true
    customersAuthDataModelId?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    aADHAARCardModelId?: true
    panCardModelId?: true
    customerPersonalInfoModelId?: true
    currentAddressModelId?: true
    permanentAddressModelId?: true
  }

  export type CustomerProfileDataModelMaxAggregateInputType = {
    id?: true
    userName?: true
    firstName?: true
    middleName?: true
    lastName?: true
    gender?: true
    emailAddress?: true
    phoneNo?: true
    whatsAppNo?: true
    avatar?: true
    userType?: true
    kycStatus?: true
    VerifiedBy?: true
    customersAuthDataModelId?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    aADHAARCardModelId?: true
    panCardModelId?: true
    customerPersonalInfoModelId?: true
    currentAddressModelId?: true
    permanentAddressModelId?: true
  }

  export type CustomerProfileDataModelCountAggregateInputType = {
    id?: true
    userName?: true
    firstName?: true
    middleName?: true
    lastName?: true
    gender?: true
    emailAddress?: true
    phoneNo?: true
    whatsAppNo?: true
    avatar?: true
    userType?: true
    kycStatus?: true
    VerifiedBy?: true
    customersAuthDataModelId?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    aADHAARCardModelId?: true
    panCardModelId?: true
    customerPersonalInfoModelId?: true
    currentAddressModelId?: true
    permanentAddressModelId?: true
    _all?: true
  }

  export type CustomerProfileDataModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomerProfileDataModel to aggregate.
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerProfileDataModels to fetch.
     */
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerProfileDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerProfileDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerProfileDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomerProfileDataModels
    **/
    _count?: true | CustomerProfileDataModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomerProfileDataModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomerProfileDataModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerProfileDataModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerProfileDataModelMaxAggregateInputType
  }

  export type GetCustomerProfileDataModelAggregateType<T extends CustomerProfileDataModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomerProfileDataModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomerProfileDataModel[P]>
      : GetScalarType<T[P], AggregateCustomerProfileDataModel[P]>
  }




  export type CustomerProfileDataModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithAggregationInput | CustomerProfileDataModelOrderByWithAggregationInput[]
    by: CustomerProfileDataModelScalarFieldEnum[] | CustomerProfileDataModelScalarFieldEnum
    having?: CustomerProfileDataModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerProfileDataModelCountAggregateInputType | true
    _avg?: CustomerProfileDataModelAvgAggregateInputType
    _sum?: CustomerProfileDataModelSumAggregateInputType
    _min?: CustomerProfileDataModelMinAggregateInputType
    _max?: CustomerProfileDataModelMaxAggregateInputType
  }

  export type CustomerProfileDataModelGroupByOutputType = {
    id: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo: string | null
    avatar: string | null
    userType: $Enums.UserAccountType
    kycStatus: $Enums.KYCStatus
    VerifiedBy: number | null
    customersAuthDataModelId: number
    createdAt: Date
    updatedAt: Date
    createdBy: number | null
    aADHAARCardModelId: number | null
    panCardModelId: number | null
    customerPersonalInfoModelId: number | null
    currentAddressModelId: number | null
    permanentAddressModelId: number | null
    _count: CustomerProfileDataModelCountAggregateOutputType | null
    _avg: CustomerProfileDataModelAvgAggregateOutputType | null
    _sum: CustomerProfileDataModelSumAggregateOutputType | null
    _min: CustomerProfileDataModelMinAggregateOutputType | null
    _max: CustomerProfileDataModelMaxAggregateOutputType | null
  }

  type GetCustomerProfileDataModelGroupByPayload<T extends CustomerProfileDataModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerProfileDataModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerProfileDataModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerProfileDataModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerProfileDataModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomerProfileDataModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userName?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    gender?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    whatsAppNo?: boolean
    avatar?: boolean
    userType?: boolean
    kycStatus?: boolean
    VerifiedBy?: boolean
    customersAuthDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    aADHAARCardModelId?: boolean
    panCardModelId?: boolean
    customerPersonalInfoModelId?: boolean
    currentAddressModelId?: boolean
    permanentAddressModelId?: boolean
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    bankAccounts?: boolean | CustomerProfileDataModel$bankAccountsArgs<ExtArgs>
    dematAccounts?: boolean | CustomerProfileDataModel$dematAccountsArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
    _count?: boolean | CustomerProfileDataModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customerProfileDataModel"]>

  export type CustomerProfileDataModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userName?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    gender?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    whatsAppNo?: boolean
    avatar?: boolean
    userType?: boolean
    kycStatus?: boolean
    VerifiedBy?: boolean
    customersAuthDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    aADHAARCardModelId?: boolean
    panCardModelId?: boolean
    customerPersonalInfoModelId?: boolean
    currentAddressModelId?: boolean
    permanentAddressModelId?: boolean
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
  }, ExtArgs["result"]["customerProfileDataModel"]>

  export type CustomerProfileDataModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userName?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    gender?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    whatsAppNo?: boolean
    avatar?: boolean
    userType?: boolean
    kycStatus?: boolean
    VerifiedBy?: boolean
    customersAuthDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    aADHAARCardModelId?: boolean
    panCardModelId?: boolean
    customerPersonalInfoModelId?: boolean
    currentAddressModelId?: boolean
    permanentAddressModelId?: boolean
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
  }, ExtArgs["result"]["customerProfileDataModel"]>

  export type CustomerProfileDataModelSelectScalar = {
    id?: boolean
    userName?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    gender?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    whatsAppNo?: boolean
    avatar?: boolean
    userType?: boolean
    kycStatus?: boolean
    VerifiedBy?: boolean
    customersAuthDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    aADHAARCardModelId?: boolean
    panCardModelId?: boolean
    customerPersonalInfoModelId?: boolean
    currentAddressModelId?: boolean
    permanentAddressModelId?: boolean
  }

  export type CustomerProfileDataModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userName" | "firstName" | "middleName" | "lastName" | "gender" | "emailAddress" | "phoneNo" | "whatsAppNo" | "avatar" | "userType" | "kycStatus" | "VerifiedBy" | "customersAuthDataModelId" | "createdAt" | "updatedAt" | "createdBy" | "aADHAARCardModelId" | "panCardModelId" | "customerPersonalInfoModelId" | "currentAddressModelId" | "permanentAddressModelId", ExtArgs["result"]["customerProfileDataModel"]>
  export type CustomerProfileDataModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    bankAccounts?: boolean | CustomerProfileDataModel$bankAccountsArgs<ExtArgs>
    dematAccounts?: boolean | CustomerProfileDataModel$dematAccountsArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
    _count?: boolean | CustomerProfileDataModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerProfileDataModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
  }
  export type CustomerProfileDataModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    utility?: boolean | CustomersAuthDataModelDefaultArgs<ExtArgs>
    aadhaarCard?: boolean | CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>
    panCard?: boolean | CustomerProfileDataModel$panCardArgs<ExtArgs>
    personalInformation?: boolean | CustomerProfileDataModel$personalInformationArgs<ExtArgs>
    currentAddress?: boolean | CustomerProfileDataModel$currentAddressArgs<ExtArgs>
    permanentAddress?: boolean | CustomerProfileDataModel$permanentAddressArgs<ExtArgs>
  }

  export type $CustomerProfileDataModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomerProfileDataModel"
    objects: {
      utility: Prisma.$CustomersAuthDataModelPayload<ExtArgs>
      /**
       * Relation with Aadhaar Card details
       */
      aadhaarCard: Prisma.$AADHAARCardModelPayload<ExtArgs> | null
      /**
       * Relation with PAN Card details
       */
      panCard: Prisma.$PanCardModelPayload<ExtArgs> | null
      personalInformation: Prisma.$CustomerPersonalInfoModelPayload<ExtArgs> | null
      /**
       * Linked bank and demat accounts
       */
      bankAccounts: Prisma.$CustomersBankAccountModelPayload<ExtArgs>[]
      dematAccounts: Prisma.$CustomersDematAccountModelPayload<ExtArgs>[]
      /**
       * Address relations (current and permanent)
       */
      currentAddress: Prisma.$AddressModelPayload<ExtArgs> | null
      permanentAddress: Prisma.$AddressModelPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Basic identity info
       */
      userName: string
      firstName: string
      middleName: string
      lastName: string
      gender: $Enums.Gender
      /**
       * Contact details
       */
      emailAddress: string
      phoneNo: string
      whatsAppNo: string | null
      /**
       * Profile visuals and type
       */
      avatar: string | null
      userType: $Enums.UserAccountType
      /**
       * KYC (Know Your Customer) related info
       */
      kycStatus: $Enums.KYCStatus
      VerifiedBy: number | null
      customersAuthDataModelId: number
      /**
       * Metadata and audit fields
       */
      createdAt: Date
      updatedAt: Date
      createdBy: number | null
      aADHAARCardModelId: number | null
      panCardModelId: number | null
      customerPersonalInfoModelId: number | null
      currentAddressModelId: number | null
      permanentAddressModelId: number | null
    }, ExtArgs["result"]["customerProfileDataModel"]>
    composites: {}
  }

  type CustomerProfileDataModelGetPayload<S extends boolean | null | undefined | CustomerProfileDataModelDefaultArgs> = $Result.GetResult<Prisma.$CustomerProfileDataModelPayload, S>

  type CustomerProfileDataModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerProfileDataModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerProfileDataModelCountAggregateInputType | true
    }

  export interface CustomerProfileDataModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomerProfileDataModel'], meta: { name: 'CustomerProfileDataModel' } }
    /**
     * Find zero or one CustomerProfileDataModel that matches the filter.
     * @param {CustomerProfileDataModelFindUniqueArgs} args - Arguments to find a CustomerProfileDataModel
     * @example
     * // Get one CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerProfileDataModelFindUniqueArgs>(args: SelectSubset<T, CustomerProfileDataModelFindUniqueArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomerProfileDataModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerProfileDataModelFindUniqueOrThrowArgs} args - Arguments to find a CustomerProfileDataModel
     * @example
     * // Get one CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerProfileDataModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerProfileDataModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomerProfileDataModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelFindFirstArgs} args - Arguments to find a CustomerProfileDataModel
     * @example
     * // Get one CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerProfileDataModelFindFirstArgs>(args?: SelectSubset<T, CustomerProfileDataModelFindFirstArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomerProfileDataModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelFindFirstOrThrowArgs} args - Arguments to find a CustomerProfileDataModel
     * @example
     * // Get one CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerProfileDataModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerProfileDataModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomerProfileDataModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomerProfileDataModels
     * const customerProfileDataModels = await prisma.customerProfileDataModel.findMany()
     * 
     * // Get first 10 CustomerProfileDataModels
     * const customerProfileDataModels = await prisma.customerProfileDataModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerProfileDataModelWithIdOnly = await prisma.customerProfileDataModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerProfileDataModelFindManyArgs>(args?: SelectSubset<T, CustomerProfileDataModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomerProfileDataModel.
     * @param {CustomerProfileDataModelCreateArgs} args - Arguments to create a CustomerProfileDataModel.
     * @example
     * // Create one CustomerProfileDataModel
     * const CustomerProfileDataModel = await prisma.customerProfileDataModel.create({
     *   data: {
     *     // ... data to create a CustomerProfileDataModel
     *   }
     * })
     * 
     */
    create<T extends CustomerProfileDataModelCreateArgs>(args: SelectSubset<T, CustomerProfileDataModelCreateArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomerProfileDataModels.
     * @param {CustomerProfileDataModelCreateManyArgs} args - Arguments to create many CustomerProfileDataModels.
     * @example
     * // Create many CustomerProfileDataModels
     * const customerProfileDataModel = await prisma.customerProfileDataModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerProfileDataModelCreateManyArgs>(args?: SelectSubset<T, CustomerProfileDataModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomerProfileDataModels and returns the data saved in the database.
     * @param {CustomerProfileDataModelCreateManyAndReturnArgs} args - Arguments to create many CustomerProfileDataModels.
     * @example
     * // Create many CustomerProfileDataModels
     * const customerProfileDataModel = await prisma.customerProfileDataModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomerProfileDataModels and only return the `id`
     * const customerProfileDataModelWithIdOnly = await prisma.customerProfileDataModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerProfileDataModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerProfileDataModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomerProfileDataModel.
     * @param {CustomerProfileDataModelDeleteArgs} args - Arguments to delete one CustomerProfileDataModel.
     * @example
     * // Delete one CustomerProfileDataModel
     * const CustomerProfileDataModel = await prisma.customerProfileDataModel.delete({
     *   where: {
     *     // ... filter to delete one CustomerProfileDataModel
     *   }
     * })
     * 
     */
    delete<T extends CustomerProfileDataModelDeleteArgs>(args: SelectSubset<T, CustomerProfileDataModelDeleteArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomerProfileDataModel.
     * @param {CustomerProfileDataModelUpdateArgs} args - Arguments to update one CustomerProfileDataModel.
     * @example
     * // Update one CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerProfileDataModelUpdateArgs>(args: SelectSubset<T, CustomerProfileDataModelUpdateArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomerProfileDataModels.
     * @param {CustomerProfileDataModelDeleteManyArgs} args - Arguments to filter CustomerProfileDataModels to delete.
     * @example
     * // Delete a few CustomerProfileDataModels
     * const { count } = await prisma.customerProfileDataModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerProfileDataModelDeleteManyArgs>(args?: SelectSubset<T, CustomerProfileDataModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomerProfileDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomerProfileDataModels
     * const customerProfileDataModel = await prisma.customerProfileDataModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerProfileDataModelUpdateManyArgs>(args: SelectSubset<T, CustomerProfileDataModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomerProfileDataModels and returns the data updated in the database.
     * @param {CustomerProfileDataModelUpdateManyAndReturnArgs} args - Arguments to update many CustomerProfileDataModels.
     * @example
     * // Update many CustomerProfileDataModels
     * const customerProfileDataModel = await prisma.customerProfileDataModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomerProfileDataModels and only return the `id`
     * const customerProfileDataModelWithIdOnly = await prisma.customerProfileDataModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomerProfileDataModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomerProfileDataModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomerProfileDataModel.
     * @param {CustomerProfileDataModelUpsertArgs} args - Arguments to update or create a CustomerProfileDataModel.
     * @example
     * // Update or create a CustomerProfileDataModel
     * const customerProfileDataModel = await prisma.customerProfileDataModel.upsert({
     *   create: {
     *     // ... data to create a CustomerProfileDataModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomerProfileDataModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomerProfileDataModelUpsertArgs>(args: SelectSubset<T, CustomerProfileDataModelUpsertArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomerProfileDataModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelCountArgs} args - Arguments to filter CustomerProfileDataModels to count.
     * @example
     * // Count the number of CustomerProfileDataModels
     * const count = await prisma.customerProfileDataModel.count({
     *   where: {
     *     // ... the filter for the CustomerProfileDataModels we want to count
     *   }
     * })
    **/
    count<T extends CustomerProfileDataModelCountArgs>(
      args?: Subset<T, CustomerProfileDataModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerProfileDataModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomerProfileDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerProfileDataModelAggregateArgs>(args: Subset<T, CustomerProfileDataModelAggregateArgs>): Prisma.PrismaPromise<GetCustomerProfileDataModelAggregateType<T>>

    /**
     * Group by CustomerProfileDataModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerProfileDataModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerProfileDataModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerProfileDataModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomerProfileDataModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerProfileDataModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerProfileDataModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomerProfileDataModel model
   */
  readonly fields: CustomerProfileDataModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomerProfileDataModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerProfileDataModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    utility<T extends CustomersAuthDataModelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomersAuthDataModelDefaultArgs<ExtArgs>>): Prisma__CustomersAuthDataModelClient<$Result.GetResult<Prisma.$CustomersAuthDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    aadhaarCard<T extends CustomerProfileDataModel$aadhaarCardArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$aadhaarCardArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    panCard<T extends CustomerProfileDataModel$panCardArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$panCardArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    personalInformation<T extends CustomerProfileDataModel$personalInformationArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$personalInformationArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    bankAccounts<T extends CustomerProfileDataModel$bankAccountsArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$bankAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    dematAccounts<T extends CustomerProfileDataModel$dematAccountsArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$dematAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    currentAddress<T extends CustomerProfileDataModel$currentAddressArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$currentAddressArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    permanentAddress<T extends CustomerProfileDataModel$permanentAddressArgs<ExtArgs> = {}>(args?: Subset<T, CustomerProfileDataModel$permanentAddressArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomerProfileDataModel model
   */
  interface CustomerProfileDataModelFieldRefs {
    readonly id: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly userName: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly firstName: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly middleName: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly lastName: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly gender: FieldRef<"CustomerProfileDataModel", 'Gender'>
    readonly emailAddress: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly phoneNo: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly whatsAppNo: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly avatar: FieldRef<"CustomerProfileDataModel", 'String'>
    readonly userType: FieldRef<"CustomerProfileDataModel", 'UserAccountType'>
    readonly kycStatus: FieldRef<"CustomerProfileDataModel", 'KYCStatus'>
    readonly VerifiedBy: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly customersAuthDataModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly createdAt: FieldRef<"CustomerProfileDataModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomerProfileDataModel", 'DateTime'>
    readonly createdBy: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly aADHAARCardModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly panCardModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly customerPersonalInfoModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly currentAddressModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
    readonly permanentAddressModelId: FieldRef<"CustomerProfileDataModel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CustomerProfileDataModel findUnique
   */
  export type CustomerProfileDataModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerProfileDataModel to fetch.
     */
    where: CustomerProfileDataModelWhereUniqueInput
  }

  /**
   * CustomerProfileDataModel findUniqueOrThrow
   */
  export type CustomerProfileDataModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerProfileDataModel to fetch.
     */
    where: CustomerProfileDataModelWhereUniqueInput
  }

  /**
   * CustomerProfileDataModel findFirst
   */
  export type CustomerProfileDataModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerProfileDataModel to fetch.
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerProfileDataModels to fetch.
     */
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomerProfileDataModels.
     */
    cursor?: CustomerProfileDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerProfileDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerProfileDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomerProfileDataModels.
     */
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * CustomerProfileDataModel findFirstOrThrow
   */
  export type CustomerProfileDataModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerProfileDataModel to fetch.
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerProfileDataModels to fetch.
     */
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomerProfileDataModels.
     */
    cursor?: CustomerProfileDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerProfileDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerProfileDataModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomerProfileDataModels.
     */
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * CustomerProfileDataModel findMany
   */
  export type CustomerProfileDataModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerProfileDataModels to fetch.
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerProfileDataModels to fetch.
     */
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomerProfileDataModels.
     */
    cursor?: CustomerProfileDataModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerProfileDataModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerProfileDataModels.
     */
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * CustomerProfileDataModel create
   */
  export type CustomerProfileDataModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomerProfileDataModel.
     */
    data: XOR<CustomerProfileDataModelCreateInput, CustomerProfileDataModelUncheckedCreateInput>
  }

  /**
   * CustomerProfileDataModel createMany
   */
  export type CustomerProfileDataModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomerProfileDataModels.
     */
    data: CustomerProfileDataModelCreateManyInput | CustomerProfileDataModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomerProfileDataModel createManyAndReturn
   */
  export type CustomerProfileDataModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomerProfileDataModels.
     */
    data: CustomerProfileDataModelCreateManyInput | CustomerProfileDataModelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomerProfileDataModel update
   */
  export type CustomerProfileDataModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomerProfileDataModel.
     */
    data: XOR<CustomerProfileDataModelUpdateInput, CustomerProfileDataModelUncheckedUpdateInput>
    /**
     * Choose, which CustomerProfileDataModel to update.
     */
    where: CustomerProfileDataModelWhereUniqueInput
  }

  /**
   * CustomerProfileDataModel updateMany
   */
  export type CustomerProfileDataModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomerProfileDataModels.
     */
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomerProfileDataModels to update
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * Limit how many CustomerProfileDataModels to update.
     */
    limit?: number
  }

  /**
   * CustomerProfileDataModel updateManyAndReturn
   */
  export type CustomerProfileDataModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomerProfileDataModels.
     */
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomerProfileDataModels to update
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * Limit how many CustomerProfileDataModels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomerProfileDataModel upsert
   */
  export type CustomerProfileDataModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomerProfileDataModel to update in case it exists.
     */
    where: CustomerProfileDataModelWhereUniqueInput
    /**
     * In case the CustomerProfileDataModel found by the `where` argument doesn't exist, create a new CustomerProfileDataModel with this data.
     */
    create: XOR<CustomerProfileDataModelCreateInput, CustomerProfileDataModelUncheckedCreateInput>
    /**
     * In case the CustomerProfileDataModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerProfileDataModelUpdateInput, CustomerProfileDataModelUncheckedUpdateInput>
  }

  /**
   * CustomerProfileDataModel delete
   */
  export type CustomerProfileDataModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    /**
     * Filter which CustomerProfileDataModel to delete.
     */
    where: CustomerProfileDataModelWhereUniqueInput
  }

  /**
   * CustomerProfileDataModel deleteMany
   */
  export type CustomerProfileDataModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomerProfileDataModels to delete
     */
    where?: CustomerProfileDataModelWhereInput
    /**
     * Limit how many CustomerProfileDataModels to delete.
     */
    limit?: number
  }

  /**
   * CustomerProfileDataModel.aadhaarCard
   */
  export type CustomerProfileDataModel$aadhaarCardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    where?: AADHAARCardModelWhereInput
  }

  /**
   * CustomerProfileDataModel.panCard
   */
  export type CustomerProfileDataModel$panCardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    where?: PanCardModelWhereInput
  }

  /**
   * CustomerProfileDataModel.personalInformation
   */
  export type CustomerProfileDataModel$personalInformationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    where?: CustomerPersonalInfoModelWhereInput
  }

  /**
   * CustomerProfileDataModel.bankAccounts
   */
  export type CustomerProfileDataModel$bankAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    where?: CustomersBankAccountModelWhereInput
    orderBy?: CustomersBankAccountModelOrderByWithRelationInput | CustomersBankAccountModelOrderByWithRelationInput[]
    cursor?: CustomersBankAccountModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomersBankAccountModelScalarFieldEnum | CustomersBankAccountModelScalarFieldEnum[]
  }

  /**
   * CustomerProfileDataModel.dematAccounts
   */
  export type CustomerProfileDataModel$dematAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    where?: CustomersDematAccountModelWhereInput
    orderBy?: CustomersDematAccountModelOrderByWithRelationInput | CustomersDematAccountModelOrderByWithRelationInput[]
    cursor?: CustomersDematAccountModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomersDematAccountModelScalarFieldEnum | CustomersDematAccountModelScalarFieldEnum[]
  }

  /**
   * CustomerProfileDataModel.currentAddress
   */
  export type CustomerProfileDataModel$currentAddressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    where?: AddressModelWhereInput
  }

  /**
   * CustomerProfileDataModel.permanentAddress
   */
  export type CustomerProfileDataModel$permanentAddressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    where?: AddressModelWhereInput
  }

  /**
   * CustomerProfileDataModel without action
   */
  export type CustomerProfileDataModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
  }


  /**
   * Model CustomerPersonalInfoModel
   */

  export type AggregateCustomerPersonalInfoModel = {
    _count: CustomerPersonalInfoModelCountAggregateOutputType | null
    _avg: CustomerPersonalInfoModelAvgAggregateOutputType | null
    _sum: CustomerPersonalInfoModelSumAggregateOutputType | null
    _min: CustomerPersonalInfoModelMinAggregateOutputType | null
    _max: CustomerPersonalInfoModelMaxAggregateOutputType | null
  }

  export type CustomerPersonalInfoModelAvgAggregateOutputType = {
    id: number | null
  }

  export type CustomerPersonalInfoModelSumAggregateOutputType = {
    id: number | null
  }

  export type CustomerPersonalInfoModelMinAggregateOutputType = {
    id: number | null
    SignatureUrl: string | null
    maritalStatus: string | null
    occupationType: string | null
    annualGrossIncome: string | null
    fatherOrSpouseName: string | null
    mothersName: string | null
    nationality: string | null
    maidenName: string | null
    residentialStatus: string | null
    qualification: string | null
    politicallyExposedPerson: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerPersonalInfoModelMaxAggregateOutputType = {
    id: number | null
    SignatureUrl: string | null
    maritalStatus: string | null
    occupationType: string | null
    annualGrossIncome: string | null
    fatherOrSpouseName: string | null
    mothersName: string | null
    nationality: string | null
    maidenName: string | null
    residentialStatus: string | null
    qualification: string | null
    politicallyExposedPerson: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomerPersonalInfoModelCountAggregateOutputType = {
    id: number
    SignatureUrl: number
    maritalStatus: number
    occupationType: number
    annualGrossIncome: number
    fatherOrSpouseName: number
    mothersName: number
    nationality: number
    maidenName: number
    residentialStatus: number
    qualification: number
    politicallyExposedPerson: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomerPersonalInfoModelAvgAggregateInputType = {
    id?: true
  }

  export type CustomerPersonalInfoModelSumAggregateInputType = {
    id?: true
  }

  export type CustomerPersonalInfoModelMinAggregateInputType = {
    id?: true
    SignatureUrl?: true
    maritalStatus?: true
    occupationType?: true
    annualGrossIncome?: true
    fatherOrSpouseName?: true
    mothersName?: true
    nationality?: true
    maidenName?: true
    residentialStatus?: true
    qualification?: true
    politicallyExposedPerson?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerPersonalInfoModelMaxAggregateInputType = {
    id?: true
    SignatureUrl?: true
    maritalStatus?: true
    occupationType?: true
    annualGrossIncome?: true
    fatherOrSpouseName?: true
    mothersName?: true
    nationality?: true
    maidenName?: true
    residentialStatus?: true
    qualification?: true
    politicallyExposedPerson?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomerPersonalInfoModelCountAggregateInputType = {
    id?: true
    SignatureUrl?: true
    maritalStatus?: true
    occupationType?: true
    annualGrossIncome?: true
    fatherOrSpouseName?: true
    mothersName?: true
    nationality?: true
    maidenName?: true
    residentialStatus?: true
    qualification?: true
    politicallyExposedPerson?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomerPersonalInfoModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomerPersonalInfoModel to aggregate.
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerPersonalInfoModels to fetch.
     */
    orderBy?: CustomerPersonalInfoModelOrderByWithRelationInput | CustomerPersonalInfoModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerPersonalInfoModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerPersonalInfoModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerPersonalInfoModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomerPersonalInfoModels
    **/
    _count?: true | CustomerPersonalInfoModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomerPersonalInfoModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomerPersonalInfoModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerPersonalInfoModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerPersonalInfoModelMaxAggregateInputType
  }

  export type GetCustomerPersonalInfoModelAggregateType<T extends CustomerPersonalInfoModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomerPersonalInfoModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomerPersonalInfoModel[P]>
      : GetScalarType<T[P], AggregateCustomerPersonalInfoModel[P]>
  }




  export type CustomerPersonalInfoModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerPersonalInfoModelWhereInput
    orderBy?: CustomerPersonalInfoModelOrderByWithAggregationInput | CustomerPersonalInfoModelOrderByWithAggregationInput[]
    by: CustomerPersonalInfoModelScalarFieldEnum[] | CustomerPersonalInfoModelScalarFieldEnum
    having?: CustomerPersonalInfoModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerPersonalInfoModelCountAggregateInputType | true
    _avg?: CustomerPersonalInfoModelAvgAggregateInputType
    _sum?: CustomerPersonalInfoModelSumAggregateInputType
    _min?: CustomerPersonalInfoModelMinAggregateInputType
    _max?: CustomerPersonalInfoModelMaxAggregateInputType
  }

  export type CustomerPersonalInfoModelGroupByOutputType = {
    id: number
    SignatureUrl: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson: string | null
    createdAt: Date
    updatedAt: Date
    _count: CustomerPersonalInfoModelCountAggregateOutputType | null
    _avg: CustomerPersonalInfoModelAvgAggregateOutputType | null
    _sum: CustomerPersonalInfoModelSumAggregateOutputType | null
    _min: CustomerPersonalInfoModelMinAggregateOutputType | null
    _max: CustomerPersonalInfoModelMaxAggregateOutputType | null
  }

  type GetCustomerPersonalInfoModelGroupByPayload<T extends CustomerPersonalInfoModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerPersonalInfoModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerPersonalInfoModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerPersonalInfoModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerPersonalInfoModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomerPersonalInfoModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    SignatureUrl?: boolean
    maritalStatus?: boolean
    occupationType?: boolean
    annualGrossIncome?: boolean
    fatherOrSpouseName?: boolean
    mothersName?: boolean
    nationality?: boolean
    maidenName?: boolean
    residentialStatus?: boolean
    qualification?: boolean
    politicallyExposedPerson?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomerPersonalInfoModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | CustomerPersonalInfoModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customerPersonalInfoModel"]>

  export type CustomerPersonalInfoModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    SignatureUrl?: boolean
    maritalStatus?: boolean
    occupationType?: boolean
    annualGrossIncome?: boolean
    fatherOrSpouseName?: boolean
    mothersName?: boolean
    nationality?: boolean
    maidenName?: boolean
    residentialStatus?: boolean
    qualification?: boolean
    politicallyExposedPerson?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customerPersonalInfoModel"]>

  export type CustomerPersonalInfoModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    SignatureUrl?: boolean
    maritalStatus?: boolean
    occupationType?: boolean
    annualGrossIncome?: boolean
    fatherOrSpouseName?: boolean
    mothersName?: boolean
    nationality?: boolean
    maidenName?: boolean
    residentialStatus?: boolean
    qualification?: boolean
    politicallyExposedPerson?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customerPersonalInfoModel"]>

  export type CustomerPersonalInfoModelSelectScalar = {
    id?: boolean
    SignatureUrl?: boolean
    maritalStatus?: boolean
    occupationType?: boolean
    annualGrossIncome?: boolean
    fatherOrSpouseName?: boolean
    mothersName?: boolean
    nationality?: boolean
    maidenName?: boolean
    residentialStatus?: boolean
    qualification?: boolean
    politicallyExposedPerson?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomerPersonalInfoModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "SignatureUrl" | "maritalStatus" | "occupationType" | "annualGrossIncome" | "fatherOrSpouseName" | "mothersName" | "nationality" | "maidenName" | "residentialStatus" | "qualification" | "politicallyExposedPerson" | "createdAt" | "updatedAt", ExtArgs["result"]["customerPersonalInfoModel"]>
  export type CustomerPersonalInfoModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomerPersonalInfoModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | CustomerPersonalInfoModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerPersonalInfoModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustomerPersonalInfoModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomerPersonalInfoModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomerPersonalInfoModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Signature image URL
       */
      SignatureUrl: string | null
      /**
       * Personal info
       */
      maritalStatus: string
      occupationType: string
      annualGrossIncome: string
      fatherOrSpouseName: string
      mothersName: string
      nationality: string
      maidenName: string | null
      residentialStatus: string
      qualification: string
      politicallyExposedPerson: string | null
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customerPersonalInfoModel"]>
    composites: {}
  }

  type CustomerPersonalInfoModelGetPayload<S extends boolean | null | undefined | CustomerPersonalInfoModelDefaultArgs> = $Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload, S>

  type CustomerPersonalInfoModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerPersonalInfoModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerPersonalInfoModelCountAggregateInputType | true
    }

  export interface CustomerPersonalInfoModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomerPersonalInfoModel'], meta: { name: 'CustomerPersonalInfoModel' } }
    /**
     * Find zero or one CustomerPersonalInfoModel that matches the filter.
     * @param {CustomerPersonalInfoModelFindUniqueArgs} args - Arguments to find a CustomerPersonalInfoModel
     * @example
     * // Get one CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerPersonalInfoModelFindUniqueArgs>(args: SelectSubset<T, CustomerPersonalInfoModelFindUniqueArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomerPersonalInfoModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerPersonalInfoModelFindUniqueOrThrowArgs} args - Arguments to find a CustomerPersonalInfoModel
     * @example
     * // Get one CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerPersonalInfoModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerPersonalInfoModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomerPersonalInfoModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelFindFirstArgs} args - Arguments to find a CustomerPersonalInfoModel
     * @example
     * // Get one CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerPersonalInfoModelFindFirstArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelFindFirstArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomerPersonalInfoModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelFindFirstOrThrowArgs} args - Arguments to find a CustomerPersonalInfoModel
     * @example
     * // Get one CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerPersonalInfoModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomerPersonalInfoModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomerPersonalInfoModels
     * const customerPersonalInfoModels = await prisma.customerPersonalInfoModel.findMany()
     * 
     * // Get first 10 CustomerPersonalInfoModels
     * const customerPersonalInfoModels = await prisma.customerPersonalInfoModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerPersonalInfoModelWithIdOnly = await prisma.customerPersonalInfoModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerPersonalInfoModelFindManyArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomerPersonalInfoModel.
     * @param {CustomerPersonalInfoModelCreateArgs} args - Arguments to create a CustomerPersonalInfoModel.
     * @example
     * // Create one CustomerPersonalInfoModel
     * const CustomerPersonalInfoModel = await prisma.customerPersonalInfoModel.create({
     *   data: {
     *     // ... data to create a CustomerPersonalInfoModel
     *   }
     * })
     * 
     */
    create<T extends CustomerPersonalInfoModelCreateArgs>(args: SelectSubset<T, CustomerPersonalInfoModelCreateArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomerPersonalInfoModels.
     * @param {CustomerPersonalInfoModelCreateManyArgs} args - Arguments to create many CustomerPersonalInfoModels.
     * @example
     * // Create many CustomerPersonalInfoModels
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerPersonalInfoModelCreateManyArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomerPersonalInfoModels and returns the data saved in the database.
     * @param {CustomerPersonalInfoModelCreateManyAndReturnArgs} args - Arguments to create many CustomerPersonalInfoModels.
     * @example
     * // Create many CustomerPersonalInfoModels
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomerPersonalInfoModels and only return the `id`
     * const customerPersonalInfoModelWithIdOnly = await prisma.customerPersonalInfoModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerPersonalInfoModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomerPersonalInfoModel.
     * @param {CustomerPersonalInfoModelDeleteArgs} args - Arguments to delete one CustomerPersonalInfoModel.
     * @example
     * // Delete one CustomerPersonalInfoModel
     * const CustomerPersonalInfoModel = await prisma.customerPersonalInfoModel.delete({
     *   where: {
     *     // ... filter to delete one CustomerPersonalInfoModel
     *   }
     * })
     * 
     */
    delete<T extends CustomerPersonalInfoModelDeleteArgs>(args: SelectSubset<T, CustomerPersonalInfoModelDeleteArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomerPersonalInfoModel.
     * @param {CustomerPersonalInfoModelUpdateArgs} args - Arguments to update one CustomerPersonalInfoModel.
     * @example
     * // Update one CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerPersonalInfoModelUpdateArgs>(args: SelectSubset<T, CustomerPersonalInfoModelUpdateArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomerPersonalInfoModels.
     * @param {CustomerPersonalInfoModelDeleteManyArgs} args - Arguments to filter CustomerPersonalInfoModels to delete.
     * @example
     * // Delete a few CustomerPersonalInfoModels
     * const { count } = await prisma.customerPersonalInfoModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerPersonalInfoModelDeleteManyArgs>(args?: SelectSubset<T, CustomerPersonalInfoModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomerPersonalInfoModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomerPersonalInfoModels
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerPersonalInfoModelUpdateManyArgs>(args: SelectSubset<T, CustomerPersonalInfoModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomerPersonalInfoModels and returns the data updated in the database.
     * @param {CustomerPersonalInfoModelUpdateManyAndReturnArgs} args - Arguments to update many CustomerPersonalInfoModels.
     * @example
     * // Update many CustomerPersonalInfoModels
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomerPersonalInfoModels and only return the `id`
     * const customerPersonalInfoModelWithIdOnly = await prisma.customerPersonalInfoModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomerPersonalInfoModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomerPersonalInfoModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomerPersonalInfoModel.
     * @param {CustomerPersonalInfoModelUpsertArgs} args - Arguments to update or create a CustomerPersonalInfoModel.
     * @example
     * // Update or create a CustomerPersonalInfoModel
     * const customerPersonalInfoModel = await prisma.customerPersonalInfoModel.upsert({
     *   create: {
     *     // ... data to create a CustomerPersonalInfoModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomerPersonalInfoModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomerPersonalInfoModelUpsertArgs>(args: SelectSubset<T, CustomerPersonalInfoModelUpsertArgs<ExtArgs>>): Prisma__CustomerPersonalInfoModelClient<$Result.GetResult<Prisma.$CustomerPersonalInfoModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomerPersonalInfoModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelCountArgs} args - Arguments to filter CustomerPersonalInfoModels to count.
     * @example
     * // Count the number of CustomerPersonalInfoModels
     * const count = await prisma.customerPersonalInfoModel.count({
     *   where: {
     *     // ... the filter for the CustomerPersonalInfoModels we want to count
     *   }
     * })
    **/
    count<T extends CustomerPersonalInfoModelCountArgs>(
      args?: Subset<T, CustomerPersonalInfoModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerPersonalInfoModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomerPersonalInfoModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerPersonalInfoModelAggregateArgs>(args: Subset<T, CustomerPersonalInfoModelAggregateArgs>): Prisma.PrismaPromise<GetCustomerPersonalInfoModelAggregateType<T>>

    /**
     * Group by CustomerPersonalInfoModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerPersonalInfoModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerPersonalInfoModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerPersonalInfoModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomerPersonalInfoModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerPersonalInfoModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerPersonalInfoModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomerPersonalInfoModel model
   */
  readonly fields: CustomerPersonalInfoModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomerPersonalInfoModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerPersonalInfoModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends CustomerPersonalInfoModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, CustomerPersonalInfoModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomerPersonalInfoModel model
   */
  interface CustomerPersonalInfoModelFieldRefs {
    readonly id: FieldRef<"CustomerPersonalInfoModel", 'Int'>
    readonly SignatureUrl: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly maritalStatus: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly occupationType: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly annualGrossIncome: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly fatherOrSpouseName: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly mothersName: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly nationality: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly maidenName: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly residentialStatus: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly qualification: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly politicallyExposedPerson: FieldRef<"CustomerPersonalInfoModel", 'String'>
    readonly createdAt: FieldRef<"CustomerPersonalInfoModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomerPersonalInfoModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomerPersonalInfoModel findUnique
   */
  export type CustomerPersonalInfoModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerPersonalInfoModel to fetch.
     */
    where: CustomerPersonalInfoModelWhereUniqueInput
  }

  /**
   * CustomerPersonalInfoModel findUniqueOrThrow
   */
  export type CustomerPersonalInfoModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerPersonalInfoModel to fetch.
     */
    where: CustomerPersonalInfoModelWhereUniqueInput
  }

  /**
   * CustomerPersonalInfoModel findFirst
   */
  export type CustomerPersonalInfoModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerPersonalInfoModel to fetch.
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerPersonalInfoModels to fetch.
     */
    orderBy?: CustomerPersonalInfoModelOrderByWithRelationInput | CustomerPersonalInfoModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomerPersonalInfoModels.
     */
    cursor?: CustomerPersonalInfoModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerPersonalInfoModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerPersonalInfoModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomerPersonalInfoModels.
     */
    distinct?: CustomerPersonalInfoModelScalarFieldEnum | CustomerPersonalInfoModelScalarFieldEnum[]
  }

  /**
   * CustomerPersonalInfoModel findFirstOrThrow
   */
  export type CustomerPersonalInfoModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerPersonalInfoModel to fetch.
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerPersonalInfoModels to fetch.
     */
    orderBy?: CustomerPersonalInfoModelOrderByWithRelationInput | CustomerPersonalInfoModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomerPersonalInfoModels.
     */
    cursor?: CustomerPersonalInfoModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerPersonalInfoModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerPersonalInfoModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomerPersonalInfoModels.
     */
    distinct?: CustomerPersonalInfoModelScalarFieldEnum | CustomerPersonalInfoModelScalarFieldEnum[]
  }

  /**
   * CustomerPersonalInfoModel findMany
   */
  export type CustomerPersonalInfoModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomerPersonalInfoModels to fetch.
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomerPersonalInfoModels to fetch.
     */
    orderBy?: CustomerPersonalInfoModelOrderByWithRelationInput | CustomerPersonalInfoModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomerPersonalInfoModels.
     */
    cursor?: CustomerPersonalInfoModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomerPersonalInfoModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomerPersonalInfoModels.
     */
    skip?: number
    distinct?: CustomerPersonalInfoModelScalarFieldEnum | CustomerPersonalInfoModelScalarFieldEnum[]
  }

  /**
   * CustomerPersonalInfoModel create
   */
  export type CustomerPersonalInfoModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomerPersonalInfoModel.
     */
    data: XOR<CustomerPersonalInfoModelCreateInput, CustomerPersonalInfoModelUncheckedCreateInput>
  }

  /**
   * CustomerPersonalInfoModel createMany
   */
  export type CustomerPersonalInfoModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomerPersonalInfoModels.
     */
    data: CustomerPersonalInfoModelCreateManyInput | CustomerPersonalInfoModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomerPersonalInfoModel createManyAndReturn
   */
  export type CustomerPersonalInfoModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomerPersonalInfoModels.
     */
    data: CustomerPersonalInfoModelCreateManyInput | CustomerPersonalInfoModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomerPersonalInfoModel update
   */
  export type CustomerPersonalInfoModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomerPersonalInfoModel.
     */
    data: XOR<CustomerPersonalInfoModelUpdateInput, CustomerPersonalInfoModelUncheckedUpdateInput>
    /**
     * Choose, which CustomerPersonalInfoModel to update.
     */
    where: CustomerPersonalInfoModelWhereUniqueInput
  }

  /**
   * CustomerPersonalInfoModel updateMany
   */
  export type CustomerPersonalInfoModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomerPersonalInfoModels.
     */
    data: XOR<CustomerPersonalInfoModelUpdateManyMutationInput, CustomerPersonalInfoModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomerPersonalInfoModels to update
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * Limit how many CustomerPersonalInfoModels to update.
     */
    limit?: number
  }

  /**
   * CustomerPersonalInfoModel updateManyAndReturn
   */
  export type CustomerPersonalInfoModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomerPersonalInfoModels.
     */
    data: XOR<CustomerPersonalInfoModelUpdateManyMutationInput, CustomerPersonalInfoModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomerPersonalInfoModels to update
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * Limit how many CustomerPersonalInfoModels to update.
     */
    limit?: number
  }

  /**
   * CustomerPersonalInfoModel upsert
   */
  export type CustomerPersonalInfoModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomerPersonalInfoModel to update in case it exists.
     */
    where: CustomerPersonalInfoModelWhereUniqueInput
    /**
     * In case the CustomerPersonalInfoModel found by the `where` argument doesn't exist, create a new CustomerPersonalInfoModel with this data.
     */
    create: XOR<CustomerPersonalInfoModelCreateInput, CustomerPersonalInfoModelUncheckedCreateInput>
    /**
     * In case the CustomerPersonalInfoModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerPersonalInfoModelUpdateInput, CustomerPersonalInfoModelUncheckedUpdateInput>
  }

  /**
   * CustomerPersonalInfoModel delete
   */
  export type CustomerPersonalInfoModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
    /**
     * Filter which CustomerPersonalInfoModel to delete.
     */
    where: CustomerPersonalInfoModelWhereUniqueInput
  }

  /**
   * CustomerPersonalInfoModel deleteMany
   */
  export type CustomerPersonalInfoModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomerPersonalInfoModels to delete
     */
    where?: CustomerPersonalInfoModelWhereInput
    /**
     * Limit how many CustomerPersonalInfoModels to delete.
     */
    limit?: number
  }

  /**
   * CustomerPersonalInfoModel.CustomerProfileDataModel
   */
  export type CustomerPersonalInfoModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * CustomerPersonalInfoModel without action
   */
  export type CustomerPersonalInfoModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerPersonalInfoModel
     */
    select?: CustomerPersonalInfoModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerPersonalInfoModel
     */
    omit?: CustomerPersonalInfoModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerPersonalInfoModelInclude<ExtArgs> | null
  }


  /**
   * Model AADHAARCardModel
   */

  export type AggregateAADHAARCardModel = {
    _count: AADHAARCardModelCountAggregateOutputType | null
    _avg: AADHAARCardModelAvgAggregateOutputType | null
    _sum: AADHAARCardModelSumAggregateOutputType | null
    _min: AADHAARCardModelMinAggregateOutputType | null
    _max: AADHAARCardModelMaxAggregateOutputType | null
  }

  export type AADHAARCardModelAvgAggregateOutputType = {
    id: number | null
  }

  export type AADHAARCardModelSumAggregateOutputType = {
    id: number | null
  }

  export type AADHAARCardModelMinAggregateOutputType = {
    id: number | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    fatherName: string | null
    aadhaarNo: string | null
    dateOfBirth: string | null
    gender: $Enums.Gender | null
    image: string | null
    isVerified: boolean | null
    verifyDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AADHAARCardModelMaxAggregateOutputType = {
    id: number | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    fatherName: string | null
    aadhaarNo: string | null
    dateOfBirth: string | null
    gender: $Enums.Gender | null
    image: string | null
    isVerified: boolean | null
    verifyDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AADHAARCardModelCountAggregateOutputType = {
    id: number
    firstName: number
    middleName: number
    lastName: number
    fatherName: number
    aadhaarNo: number
    dateOfBirth: number
    gender: number
    image: number
    isVerified: number
    verifyDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AADHAARCardModelAvgAggregateInputType = {
    id?: true
  }

  export type AADHAARCardModelSumAggregateInputType = {
    id?: true
  }

  export type AADHAARCardModelMinAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    fatherName?: true
    aadhaarNo?: true
    dateOfBirth?: true
    gender?: true
    image?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AADHAARCardModelMaxAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    fatherName?: true
    aadhaarNo?: true
    dateOfBirth?: true
    gender?: true
    image?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AADHAARCardModelCountAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    fatherName?: true
    aadhaarNo?: true
    dateOfBirth?: true
    gender?: true
    image?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AADHAARCardModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AADHAARCardModel to aggregate.
     */
    where?: AADHAARCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AADHAARCardModels to fetch.
     */
    orderBy?: AADHAARCardModelOrderByWithRelationInput | AADHAARCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AADHAARCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AADHAARCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AADHAARCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AADHAARCardModels
    **/
    _count?: true | AADHAARCardModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AADHAARCardModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AADHAARCardModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AADHAARCardModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AADHAARCardModelMaxAggregateInputType
  }

  export type GetAADHAARCardModelAggregateType<T extends AADHAARCardModelAggregateArgs> = {
        [P in keyof T & keyof AggregateAADHAARCardModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAADHAARCardModel[P]>
      : GetScalarType<T[P], AggregateAADHAARCardModel[P]>
  }




  export type AADHAARCardModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AADHAARCardModelWhereInput
    orderBy?: AADHAARCardModelOrderByWithAggregationInput | AADHAARCardModelOrderByWithAggregationInput[]
    by: AADHAARCardModelScalarFieldEnum[] | AADHAARCardModelScalarFieldEnum
    having?: AADHAARCardModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AADHAARCardModelCountAggregateInputType | true
    _avg?: AADHAARCardModelAvgAggregateInputType
    _sum?: AADHAARCardModelSumAggregateInputType
    _min?: AADHAARCardModelMinAggregateInputType
    _max?: AADHAARCardModelMaxAggregateInputType
  }

  export type AADHAARCardModelGroupByOutputType = {
    id: number
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified: boolean
    verifyDate: Date
    createdAt: Date
    updatedAt: Date
    _count: AADHAARCardModelCountAggregateOutputType | null
    _avg: AADHAARCardModelAvgAggregateOutputType | null
    _sum: AADHAARCardModelSumAggregateOutputType | null
    _min: AADHAARCardModelMinAggregateOutputType | null
    _max: AADHAARCardModelMaxAggregateOutputType | null
  }

  type GetAADHAARCardModelGroupByPayload<T extends AADHAARCardModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AADHAARCardModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AADHAARCardModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AADHAARCardModelGroupByOutputType[P]>
            : GetScalarType<T[P], AADHAARCardModelGroupByOutputType[P]>
        }
      >
    >


  export type AADHAARCardModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    fatherName?: boolean
    aadhaarNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    image?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | AADHAARCardModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | AADHAARCardModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aADHAARCardModel"]>

  export type AADHAARCardModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    fatherName?: boolean
    aadhaarNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    image?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["aADHAARCardModel"]>

  export type AADHAARCardModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    fatherName?: boolean
    aadhaarNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    image?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["aADHAARCardModel"]>

  export type AADHAARCardModelSelectScalar = {
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    fatherName?: boolean
    aadhaarNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    image?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AADHAARCardModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "middleName" | "lastName" | "fatherName" | "aadhaarNo" | "dateOfBirth" | "gender" | "image" | "isVerified" | "verifyDate" | "createdAt" | "updatedAt", ExtArgs["result"]["aADHAARCardModel"]>
  export type AADHAARCardModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | AADHAARCardModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | AADHAARCardModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AADHAARCardModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AADHAARCardModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AADHAARCardModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AADHAARCardModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Name details as per Aadhaar
       */
      firstName: string
      middleName: string
      lastName: string
      /**
       * Father’s name for verification
       */
      fatherName: string
      /**
       * Aadhaar details
       */
      aadhaarNo: string
      dateOfBirth: string
      gender: $Enums.Gender
      image: string
      /**
       * Verification status
       */
      isVerified: boolean
      verifyDate: Date
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["aADHAARCardModel"]>
    composites: {}
  }

  type AADHAARCardModelGetPayload<S extends boolean | null | undefined | AADHAARCardModelDefaultArgs> = $Result.GetResult<Prisma.$AADHAARCardModelPayload, S>

  type AADHAARCardModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AADHAARCardModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AADHAARCardModelCountAggregateInputType | true
    }

  export interface AADHAARCardModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AADHAARCardModel'], meta: { name: 'AADHAARCardModel' } }
    /**
     * Find zero or one AADHAARCardModel that matches the filter.
     * @param {AADHAARCardModelFindUniqueArgs} args - Arguments to find a AADHAARCardModel
     * @example
     * // Get one AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AADHAARCardModelFindUniqueArgs>(args: SelectSubset<T, AADHAARCardModelFindUniqueArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AADHAARCardModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AADHAARCardModelFindUniqueOrThrowArgs} args - Arguments to find a AADHAARCardModel
     * @example
     * // Get one AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AADHAARCardModelFindUniqueOrThrowArgs>(args: SelectSubset<T, AADHAARCardModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AADHAARCardModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelFindFirstArgs} args - Arguments to find a AADHAARCardModel
     * @example
     * // Get one AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AADHAARCardModelFindFirstArgs>(args?: SelectSubset<T, AADHAARCardModelFindFirstArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AADHAARCardModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelFindFirstOrThrowArgs} args - Arguments to find a AADHAARCardModel
     * @example
     * // Get one AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AADHAARCardModelFindFirstOrThrowArgs>(args?: SelectSubset<T, AADHAARCardModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AADHAARCardModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AADHAARCardModels
     * const aADHAARCardModels = await prisma.aADHAARCardModel.findMany()
     * 
     * // Get first 10 AADHAARCardModels
     * const aADHAARCardModels = await prisma.aADHAARCardModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aADHAARCardModelWithIdOnly = await prisma.aADHAARCardModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AADHAARCardModelFindManyArgs>(args?: SelectSubset<T, AADHAARCardModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AADHAARCardModel.
     * @param {AADHAARCardModelCreateArgs} args - Arguments to create a AADHAARCardModel.
     * @example
     * // Create one AADHAARCardModel
     * const AADHAARCardModel = await prisma.aADHAARCardModel.create({
     *   data: {
     *     // ... data to create a AADHAARCardModel
     *   }
     * })
     * 
     */
    create<T extends AADHAARCardModelCreateArgs>(args: SelectSubset<T, AADHAARCardModelCreateArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AADHAARCardModels.
     * @param {AADHAARCardModelCreateManyArgs} args - Arguments to create many AADHAARCardModels.
     * @example
     * // Create many AADHAARCardModels
     * const aADHAARCardModel = await prisma.aADHAARCardModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AADHAARCardModelCreateManyArgs>(args?: SelectSubset<T, AADHAARCardModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AADHAARCardModels and returns the data saved in the database.
     * @param {AADHAARCardModelCreateManyAndReturnArgs} args - Arguments to create many AADHAARCardModels.
     * @example
     * // Create many AADHAARCardModels
     * const aADHAARCardModel = await prisma.aADHAARCardModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AADHAARCardModels and only return the `id`
     * const aADHAARCardModelWithIdOnly = await prisma.aADHAARCardModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AADHAARCardModelCreateManyAndReturnArgs>(args?: SelectSubset<T, AADHAARCardModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AADHAARCardModel.
     * @param {AADHAARCardModelDeleteArgs} args - Arguments to delete one AADHAARCardModel.
     * @example
     * // Delete one AADHAARCardModel
     * const AADHAARCardModel = await prisma.aADHAARCardModel.delete({
     *   where: {
     *     // ... filter to delete one AADHAARCardModel
     *   }
     * })
     * 
     */
    delete<T extends AADHAARCardModelDeleteArgs>(args: SelectSubset<T, AADHAARCardModelDeleteArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AADHAARCardModel.
     * @param {AADHAARCardModelUpdateArgs} args - Arguments to update one AADHAARCardModel.
     * @example
     * // Update one AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AADHAARCardModelUpdateArgs>(args: SelectSubset<T, AADHAARCardModelUpdateArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AADHAARCardModels.
     * @param {AADHAARCardModelDeleteManyArgs} args - Arguments to filter AADHAARCardModels to delete.
     * @example
     * // Delete a few AADHAARCardModels
     * const { count } = await prisma.aADHAARCardModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AADHAARCardModelDeleteManyArgs>(args?: SelectSubset<T, AADHAARCardModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AADHAARCardModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AADHAARCardModels
     * const aADHAARCardModel = await prisma.aADHAARCardModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AADHAARCardModelUpdateManyArgs>(args: SelectSubset<T, AADHAARCardModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AADHAARCardModels and returns the data updated in the database.
     * @param {AADHAARCardModelUpdateManyAndReturnArgs} args - Arguments to update many AADHAARCardModels.
     * @example
     * // Update many AADHAARCardModels
     * const aADHAARCardModel = await prisma.aADHAARCardModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AADHAARCardModels and only return the `id`
     * const aADHAARCardModelWithIdOnly = await prisma.aADHAARCardModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AADHAARCardModelUpdateManyAndReturnArgs>(args: SelectSubset<T, AADHAARCardModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AADHAARCardModel.
     * @param {AADHAARCardModelUpsertArgs} args - Arguments to update or create a AADHAARCardModel.
     * @example
     * // Update or create a AADHAARCardModel
     * const aADHAARCardModel = await prisma.aADHAARCardModel.upsert({
     *   create: {
     *     // ... data to create a AADHAARCardModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AADHAARCardModel we want to update
     *   }
     * })
     */
    upsert<T extends AADHAARCardModelUpsertArgs>(args: SelectSubset<T, AADHAARCardModelUpsertArgs<ExtArgs>>): Prisma__AADHAARCardModelClient<$Result.GetResult<Prisma.$AADHAARCardModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AADHAARCardModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelCountArgs} args - Arguments to filter AADHAARCardModels to count.
     * @example
     * // Count the number of AADHAARCardModels
     * const count = await prisma.aADHAARCardModel.count({
     *   where: {
     *     // ... the filter for the AADHAARCardModels we want to count
     *   }
     * })
    **/
    count<T extends AADHAARCardModelCountArgs>(
      args?: Subset<T, AADHAARCardModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AADHAARCardModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AADHAARCardModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AADHAARCardModelAggregateArgs>(args: Subset<T, AADHAARCardModelAggregateArgs>): Prisma.PrismaPromise<GetAADHAARCardModelAggregateType<T>>

    /**
     * Group by AADHAARCardModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AADHAARCardModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AADHAARCardModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AADHAARCardModelGroupByArgs['orderBy'] }
        : { orderBy?: AADHAARCardModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AADHAARCardModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAADHAARCardModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AADHAARCardModel model
   */
  readonly fields: AADHAARCardModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AADHAARCardModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AADHAARCardModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends AADHAARCardModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, AADHAARCardModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AADHAARCardModel model
   */
  interface AADHAARCardModelFieldRefs {
    readonly id: FieldRef<"AADHAARCardModel", 'Int'>
    readonly firstName: FieldRef<"AADHAARCardModel", 'String'>
    readonly middleName: FieldRef<"AADHAARCardModel", 'String'>
    readonly lastName: FieldRef<"AADHAARCardModel", 'String'>
    readonly fatherName: FieldRef<"AADHAARCardModel", 'String'>
    readonly aadhaarNo: FieldRef<"AADHAARCardModel", 'String'>
    readonly dateOfBirth: FieldRef<"AADHAARCardModel", 'String'>
    readonly gender: FieldRef<"AADHAARCardModel", 'Gender'>
    readonly image: FieldRef<"AADHAARCardModel", 'String'>
    readonly isVerified: FieldRef<"AADHAARCardModel", 'Boolean'>
    readonly verifyDate: FieldRef<"AADHAARCardModel", 'DateTime'>
    readonly createdAt: FieldRef<"AADHAARCardModel", 'DateTime'>
    readonly updatedAt: FieldRef<"AADHAARCardModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AADHAARCardModel findUnique
   */
  export type AADHAARCardModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter, which AADHAARCardModel to fetch.
     */
    where: AADHAARCardModelWhereUniqueInput
  }

  /**
   * AADHAARCardModel findUniqueOrThrow
   */
  export type AADHAARCardModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter, which AADHAARCardModel to fetch.
     */
    where: AADHAARCardModelWhereUniqueInput
  }

  /**
   * AADHAARCardModel findFirst
   */
  export type AADHAARCardModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter, which AADHAARCardModel to fetch.
     */
    where?: AADHAARCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AADHAARCardModels to fetch.
     */
    orderBy?: AADHAARCardModelOrderByWithRelationInput | AADHAARCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AADHAARCardModels.
     */
    cursor?: AADHAARCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AADHAARCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AADHAARCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AADHAARCardModels.
     */
    distinct?: AADHAARCardModelScalarFieldEnum | AADHAARCardModelScalarFieldEnum[]
  }

  /**
   * AADHAARCardModel findFirstOrThrow
   */
  export type AADHAARCardModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter, which AADHAARCardModel to fetch.
     */
    where?: AADHAARCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AADHAARCardModels to fetch.
     */
    orderBy?: AADHAARCardModelOrderByWithRelationInput | AADHAARCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AADHAARCardModels.
     */
    cursor?: AADHAARCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AADHAARCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AADHAARCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AADHAARCardModels.
     */
    distinct?: AADHAARCardModelScalarFieldEnum | AADHAARCardModelScalarFieldEnum[]
  }

  /**
   * AADHAARCardModel findMany
   */
  export type AADHAARCardModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter, which AADHAARCardModels to fetch.
     */
    where?: AADHAARCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AADHAARCardModels to fetch.
     */
    orderBy?: AADHAARCardModelOrderByWithRelationInput | AADHAARCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AADHAARCardModels.
     */
    cursor?: AADHAARCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AADHAARCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AADHAARCardModels.
     */
    skip?: number
    distinct?: AADHAARCardModelScalarFieldEnum | AADHAARCardModelScalarFieldEnum[]
  }

  /**
   * AADHAARCardModel create
   */
  export type AADHAARCardModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * The data needed to create a AADHAARCardModel.
     */
    data: XOR<AADHAARCardModelCreateInput, AADHAARCardModelUncheckedCreateInput>
  }

  /**
   * AADHAARCardModel createMany
   */
  export type AADHAARCardModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AADHAARCardModels.
     */
    data: AADHAARCardModelCreateManyInput | AADHAARCardModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AADHAARCardModel createManyAndReturn
   */
  export type AADHAARCardModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * The data used to create many AADHAARCardModels.
     */
    data: AADHAARCardModelCreateManyInput | AADHAARCardModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AADHAARCardModel update
   */
  export type AADHAARCardModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * The data needed to update a AADHAARCardModel.
     */
    data: XOR<AADHAARCardModelUpdateInput, AADHAARCardModelUncheckedUpdateInput>
    /**
     * Choose, which AADHAARCardModel to update.
     */
    where: AADHAARCardModelWhereUniqueInput
  }

  /**
   * AADHAARCardModel updateMany
   */
  export type AADHAARCardModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AADHAARCardModels.
     */
    data: XOR<AADHAARCardModelUpdateManyMutationInput, AADHAARCardModelUncheckedUpdateManyInput>
    /**
     * Filter which AADHAARCardModels to update
     */
    where?: AADHAARCardModelWhereInput
    /**
     * Limit how many AADHAARCardModels to update.
     */
    limit?: number
  }

  /**
   * AADHAARCardModel updateManyAndReturn
   */
  export type AADHAARCardModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * The data used to update AADHAARCardModels.
     */
    data: XOR<AADHAARCardModelUpdateManyMutationInput, AADHAARCardModelUncheckedUpdateManyInput>
    /**
     * Filter which AADHAARCardModels to update
     */
    where?: AADHAARCardModelWhereInput
    /**
     * Limit how many AADHAARCardModels to update.
     */
    limit?: number
  }

  /**
   * AADHAARCardModel upsert
   */
  export type AADHAARCardModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * The filter to search for the AADHAARCardModel to update in case it exists.
     */
    where: AADHAARCardModelWhereUniqueInput
    /**
     * In case the AADHAARCardModel found by the `where` argument doesn't exist, create a new AADHAARCardModel with this data.
     */
    create: XOR<AADHAARCardModelCreateInput, AADHAARCardModelUncheckedCreateInput>
    /**
     * In case the AADHAARCardModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AADHAARCardModelUpdateInput, AADHAARCardModelUncheckedUpdateInput>
  }

  /**
   * AADHAARCardModel delete
   */
  export type AADHAARCardModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
    /**
     * Filter which AADHAARCardModel to delete.
     */
    where: AADHAARCardModelWhereUniqueInput
  }

  /**
   * AADHAARCardModel deleteMany
   */
  export type AADHAARCardModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AADHAARCardModels to delete
     */
    where?: AADHAARCardModelWhereInput
    /**
     * Limit how many AADHAARCardModels to delete.
     */
    limit?: number
  }

  /**
   * AADHAARCardModel.CustomerProfileDataModel
   */
  export type AADHAARCardModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * AADHAARCardModel without action
   */
  export type AADHAARCardModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AADHAARCardModel
     */
    select?: AADHAARCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AADHAARCardModel
     */
    omit?: AADHAARCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AADHAARCardModelInclude<ExtArgs> | null
  }


  /**
   * Model PanCardModel
   */

  export type AggregatePanCardModel = {
    _count: PanCardModelCountAggregateOutputType | null
    _avg: PanCardModelAvgAggregateOutputType | null
    _sum: PanCardModelSumAggregateOutputType | null
    _min: PanCardModelMinAggregateOutputType | null
    _max: PanCardModelMaxAggregateOutputType | null
  }

  export type PanCardModelAvgAggregateOutputType = {
    id: number | null
  }

  export type PanCardModelSumAggregateOutputType = {
    id: number | null
  }

  export type PanCardModelMinAggregateOutputType = {
    id: number | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    panCardNo: string | null
    dateOfBirth: string | null
    gender: $Enums.Gender | null
    isVerified: boolean | null
    verifyDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PanCardModelMaxAggregateOutputType = {
    id: number | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    panCardNo: string | null
    dateOfBirth: string | null
    gender: $Enums.Gender | null
    isVerified: boolean | null
    verifyDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PanCardModelCountAggregateOutputType = {
    id: number
    firstName: number
    middleName: number
    lastName: number
    panCardNo: number
    dateOfBirth: number
    gender: number
    isVerified: number
    verifyDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PanCardModelAvgAggregateInputType = {
    id?: true
  }

  export type PanCardModelSumAggregateInputType = {
    id?: true
  }

  export type PanCardModelMinAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    panCardNo?: true
    dateOfBirth?: true
    gender?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PanCardModelMaxAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    panCardNo?: true
    dateOfBirth?: true
    gender?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PanCardModelCountAggregateInputType = {
    id?: true
    firstName?: true
    middleName?: true
    lastName?: true
    panCardNo?: true
    dateOfBirth?: true
    gender?: true
    isVerified?: true
    verifyDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PanCardModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PanCardModel to aggregate.
     */
    where?: PanCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PanCardModels to fetch.
     */
    orderBy?: PanCardModelOrderByWithRelationInput | PanCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PanCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PanCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PanCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PanCardModels
    **/
    _count?: true | PanCardModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PanCardModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PanCardModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PanCardModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PanCardModelMaxAggregateInputType
  }

  export type GetPanCardModelAggregateType<T extends PanCardModelAggregateArgs> = {
        [P in keyof T & keyof AggregatePanCardModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePanCardModel[P]>
      : GetScalarType<T[P], AggregatePanCardModel[P]>
  }




  export type PanCardModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PanCardModelWhereInput
    orderBy?: PanCardModelOrderByWithAggregationInput | PanCardModelOrderByWithAggregationInput[]
    by: PanCardModelScalarFieldEnum[] | PanCardModelScalarFieldEnum
    having?: PanCardModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PanCardModelCountAggregateInputType | true
    _avg?: PanCardModelAvgAggregateInputType
    _sum?: PanCardModelSumAggregateInputType
    _min?: PanCardModelMinAggregateInputType
    _max?: PanCardModelMaxAggregateInputType
  }

  export type PanCardModelGroupByOutputType = {
    id: number
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified: boolean
    verifyDate: Date
    createdAt: Date
    updatedAt: Date
    _count: PanCardModelCountAggregateOutputType | null
    _avg: PanCardModelAvgAggregateOutputType | null
    _sum: PanCardModelSumAggregateOutputType | null
    _min: PanCardModelMinAggregateOutputType | null
    _max: PanCardModelMaxAggregateOutputType | null
  }

  type GetPanCardModelGroupByPayload<T extends PanCardModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PanCardModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PanCardModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PanCardModelGroupByOutputType[P]>
            : GetScalarType<T[P], PanCardModelGroupByOutputType[P]>
        }
      >
    >


  export type PanCardModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    panCardNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | PanCardModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | PanCardModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["panCardModel"]>

  export type PanCardModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    panCardNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["panCardModel"]>

  export type PanCardModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    panCardNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["panCardModel"]>

  export type PanCardModelSelectScalar = {
    id?: boolean
    firstName?: boolean
    middleName?: boolean
    lastName?: boolean
    panCardNo?: boolean
    dateOfBirth?: boolean
    gender?: boolean
    isVerified?: boolean
    verifyDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PanCardModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "middleName" | "lastName" | "panCardNo" | "dateOfBirth" | "gender" | "isVerified" | "verifyDate" | "createdAt" | "updatedAt", ExtArgs["result"]["panCardModel"]>
  export type PanCardModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | PanCardModel$CustomerProfileDataModelArgs<ExtArgs>
    _count?: boolean | PanCardModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PanCardModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PanCardModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PanCardModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PanCardModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Name details as per PAN
       */
      firstName: string
      middleName: string
      lastName: string
      /**
       * PAN card details
       */
      panCardNo: string
      dateOfBirth: string
      gender: $Enums.Gender
      /**
       * Verification status
       */
      isVerified: boolean
      verifyDate: Date
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["panCardModel"]>
    composites: {}
  }

  type PanCardModelGetPayload<S extends boolean | null | undefined | PanCardModelDefaultArgs> = $Result.GetResult<Prisma.$PanCardModelPayload, S>

  type PanCardModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PanCardModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PanCardModelCountAggregateInputType | true
    }

  export interface PanCardModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PanCardModel'], meta: { name: 'PanCardModel' } }
    /**
     * Find zero or one PanCardModel that matches the filter.
     * @param {PanCardModelFindUniqueArgs} args - Arguments to find a PanCardModel
     * @example
     * // Get one PanCardModel
     * const panCardModel = await prisma.panCardModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PanCardModelFindUniqueArgs>(args: SelectSubset<T, PanCardModelFindUniqueArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PanCardModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PanCardModelFindUniqueOrThrowArgs} args - Arguments to find a PanCardModel
     * @example
     * // Get one PanCardModel
     * const panCardModel = await prisma.panCardModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PanCardModelFindUniqueOrThrowArgs>(args: SelectSubset<T, PanCardModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PanCardModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelFindFirstArgs} args - Arguments to find a PanCardModel
     * @example
     * // Get one PanCardModel
     * const panCardModel = await prisma.panCardModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PanCardModelFindFirstArgs>(args?: SelectSubset<T, PanCardModelFindFirstArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PanCardModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelFindFirstOrThrowArgs} args - Arguments to find a PanCardModel
     * @example
     * // Get one PanCardModel
     * const panCardModel = await prisma.panCardModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PanCardModelFindFirstOrThrowArgs>(args?: SelectSubset<T, PanCardModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PanCardModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PanCardModels
     * const panCardModels = await prisma.panCardModel.findMany()
     * 
     * // Get first 10 PanCardModels
     * const panCardModels = await prisma.panCardModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const panCardModelWithIdOnly = await prisma.panCardModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PanCardModelFindManyArgs>(args?: SelectSubset<T, PanCardModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PanCardModel.
     * @param {PanCardModelCreateArgs} args - Arguments to create a PanCardModel.
     * @example
     * // Create one PanCardModel
     * const PanCardModel = await prisma.panCardModel.create({
     *   data: {
     *     // ... data to create a PanCardModel
     *   }
     * })
     * 
     */
    create<T extends PanCardModelCreateArgs>(args: SelectSubset<T, PanCardModelCreateArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PanCardModels.
     * @param {PanCardModelCreateManyArgs} args - Arguments to create many PanCardModels.
     * @example
     * // Create many PanCardModels
     * const panCardModel = await prisma.panCardModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PanCardModelCreateManyArgs>(args?: SelectSubset<T, PanCardModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PanCardModels and returns the data saved in the database.
     * @param {PanCardModelCreateManyAndReturnArgs} args - Arguments to create many PanCardModels.
     * @example
     * // Create many PanCardModels
     * const panCardModel = await prisma.panCardModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PanCardModels and only return the `id`
     * const panCardModelWithIdOnly = await prisma.panCardModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PanCardModelCreateManyAndReturnArgs>(args?: SelectSubset<T, PanCardModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PanCardModel.
     * @param {PanCardModelDeleteArgs} args - Arguments to delete one PanCardModel.
     * @example
     * // Delete one PanCardModel
     * const PanCardModel = await prisma.panCardModel.delete({
     *   where: {
     *     // ... filter to delete one PanCardModel
     *   }
     * })
     * 
     */
    delete<T extends PanCardModelDeleteArgs>(args: SelectSubset<T, PanCardModelDeleteArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PanCardModel.
     * @param {PanCardModelUpdateArgs} args - Arguments to update one PanCardModel.
     * @example
     * // Update one PanCardModel
     * const panCardModel = await prisma.panCardModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PanCardModelUpdateArgs>(args: SelectSubset<T, PanCardModelUpdateArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PanCardModels.
     * @param {PanCardModelDeleteManyArgs} args - Arguments to filter PanCardModels to delete.
     * @example
     * // Delete a few PanCardModels
     * const { count } = await prisma.panCardModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PanCardModelDeleteManyArgs>(args?: SelectSubset<T, PanCardModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PanCardModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PanCardModels
     * const panCardModel = await prisma.panCardModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PanCardModelUpdateManyArgs>(args: SelectSubset<T, PanCardModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PanCardModels and returns the data updated in the database.
     * @param {PanCardModelUpdateManyAndReturnArgs} args - Arguments to update many PanCardModels.
     * @example
     * // Update many PanCardModels
     * const panCardModel = await prisma.panCardModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PanCardModels and only return the `id`
     * const panCardModelWithIdOnly = await prisma.panCardModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PanCardModelUpdateManyAndReturnArgs>(args: SelectSubset<T, PanCardModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PanCardModel.
     * @param {PanCardModelUpsertArgs} args - Arguments to update or create a PanCardModel.
     * @example
     * // Update or create a PanCardModel
     * const panCardModel = await prisma.panCardModel.upsert({
     *   create: {
     *     // ... data to create a PanCardModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PanCardModel we want to update
     *   }
     * })
     */
    upsert<T extends PanCardModelUpsertArgs>(args: SelectSubset<T, PanCardModelUpsertArgs<ExtArgs>>): Prisma__PanCardModelClient<$Result.GetResult<Prisma.$PanCardModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PanCardModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelCountArgs} args - Arguments to filter PanCardModels to count.
     * @example
     * // Count the number of PanCardModels
     * const count = await prisma.panCardModel.count({
     *   where: {
     *     // ... the filter for the PanCardModels we want to count
     *   }
     * })
    **/
    count<T extends PanCardModelCountArgs>(
      args?: Subset<T, PanCardModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PanCardModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PanCardModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PanCardModelAggregateArgs>(args: Subset<T, PanCardModelAggregateArgs>): Prisma.PrismaPromise<GetPanCardModelAggregateType<T>>

    /**
     * Group by PanCardModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PanCardModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PanCardModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PanCardModelGroupByArgs['orderBy'] }
        : { orderBy?: PanCardModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PanCardModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPanCardModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PanCardModel model
   */
  readonly fields: PanCardModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PanCardModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PanCardModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends PanCardModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, PanCardModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PanCardModel model
   */
  interface PanCardModelFieldRefs {
    readonly id: FieldRef<"PanCardModel", 'Int'>
    readonly firstName: FieldRef<"PanCardModel", 'String'>
    readonly middleName: FieldRef<"PanCardModel", 'String'>
    readonly lastName: FieldRef<"PanCardModel", 'String'>
    readonly panCardNo: FieldRef<"PanCardModel", 'String'>
    readonly dateOfBirth: FieldRef<"PanCardModel", 'String'>
    readonly gender: FieldRef<"PanCardModel", 'Gender'>
    readonly isVerified: FieldRef<"PanCardModel", 'Boolean'>
    readonly verifyDate: FieldRef<"PanCardModel", 'DateTime'>
    readonly createdAt: FieldRef<"PanCardModel", 'DateTime'>
    readonly updatedAt: FieldRef<"PanCardModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PanCardModel findUnique
   */
  export type PanCardModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter, which PanCardModel to fetch.
     */
    where: PanCardModelWhereUniqueInput
  }

  /**
   * PanCardModel findUniqueOrThrow
   */
  export type PanCardModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter, which PanCardModel to fetch.
     */
    where: PanCardModelWhereUniqueInput
  }

  /**
   * PanCardModel findFirst
   */
  export type PanCardModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter, which PanCardModel to fetch.
     */
    where?: PanCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PanCardModels to fetch.
     */
    orderBy?: PanCardModelOrderByWithRelationInput | PanCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PanCardModels.
     */
    cursor?: PanCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PanCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PanCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PanCardModels.
     */
    distinct?: PanCardModelScalarFieldEnum | PanCardModelScalarFieldEnum[]
  }

  /**
   * PanCardModel findFirstOrThrow
   */
  export type PanCardModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter, which PanCardModel to fetch.
     */
    where?: PanCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PanCardModels to fetch.
     */
    orderBy?: PanCardModelOrderByWithRelationInput | PanCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PanCardModels.
     */
    cursor?: PanCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PanCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PanCardModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PanCardModels.
     */
    distinct?: PanCardModelScalarFieldEnum | PanCardModelScalarFieldEnum[]
  }

  /**
   * PanCardModel findMany
   */
  export type PanCardModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter, which PanCardModels to fetch.
     */
    where?: PanCardModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PanCardModels to fetch.
     */
    orderBy?: PanCardModelOrderByWithRelationInput | PanCardModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PanCardModels.
     */
    cursor?: PanCardModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PanCardModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PanCardModels.
     */
    skip?: number
    distinct?: PanCardModelScalarFieldEnum | PanCardModelScalarFieldEnum[]
  }

  /**
   * PanCardModel create
   */
  export type PanCardModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * The data needed to create a PanCardModel.
     */
    data: XOR<PanCardModelCreateInput, PanCardModelUncheckedCreateInput>
  }

  /**
   * PanCardModel createMany
   */
  export type PanCardModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PanCardModels.
     */
    data: PanCardModelCreateManyInput | PanCardModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PanCardModel createManyAndReturn
   */
  export type PanCardModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * The data used to create many PanCardModels.
     */
    data: PanCardModelCreateManyInput | PanCardModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PanCardModel update
   */
  export type PanCardModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * The data needed to update a PanCardModel.
     */
    data: XOR<PanCardModelUpdateInput, PanCardModelUncheckedUpdateInput>
    /**
     * Choose, which PanCardModel to update.
     */
    where: PanCardModelWhereUniqueInput
  }

  /**
   * PanCardModel updateMany
   */
  export type PanCardModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PanCardModels.
     */
    data: XOR<PanCardModelUpdateManyMutationInput, PanCardModelUncheckedUpdateManyInput>
    /**
     * Filter which PanCardModels to update
     */
    where?: PanCardModelWhereInput
    /**
     * Limit how many PanCardModels to update.
     */
    limit?: number
  }

  /**
   * PanCardModel updateManyAndReturn
   */
  export type PanCardModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * The data used to update PanCardModels.
     */
    data: XOR<PanCardModelUpdateManyMutationInput, PanCardModelUncheckedUpdateManyInput>
    /**
     * Filter which PanCardModels to update
     */
    where?: PanCardModelWhereInput
    /**
     * Limit how many PanCardModels to update.
     */
    limit?: number
  }

  /**
   * PanCardModel upsert
   */
  export type PanCardModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * The filter to search for the PanCardModel to update in case it exists.
     */
    where: PanCardModelWhereUniqueInput
    /**
     * In case the PanCardModel found by the `where` argument doesn't exist, create a new PanCardModel with this data.
     */
    create: XOR<PanCardModelCreateInput, PanCardModelUncheckedCreateInput>
    /**
     * In case the PanCardModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PanCardModelUpdateInput, PanCardModelUncheckedUpdateInput>
  }

  /**
   * PanCardModel delete
   */
  export type PanCardModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
    /**
     * Filter which PanCardModel to delete.
     */
    where: PanCardModelWhereUniqueInput
  }

  /**
   * PanCardModel deleteMany
   */
  export type PanCardModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PanCardModels to delete
     */
    where?: PanCardModelWhereInput
    /**
     * Limit how many PanCardModels to delete.
     */
    limit?: number
  }

  /**
   * PanCardModel.CustomerProfileDataModel
   */
  export type PanCardModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * PanCardModel without action
   */
  export type PanCardModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PanCardModel
     */
    select?: PanCardModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PanCardModel
     */
    omit?: PanCardModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PanCardModelInclude<ExtArgs> | null
  }


  /**
   * Model CustomersBankAccountModel
   */

  export type AggregateCustomersBankAccountModel = {
    _count: CustomersBankAccountModelCountAggregateOutputType | null
    _avg: CustomersBankAccountModelAvgAggregateOutputType | null
    _sum: CustomersBankAccountModelSumAggregateOutputType | null
    _min: CustomersBankAccountModelMinAggregateOutputType | null
    _max: CustomersBankAccountModelMaxAggregateOutputType | null
  }

  export type CustomersBankAccountModelAvgAggregateOutputType = {
    id: number | null
    customerProfileDataModelId: number | null
  }

  export type CustomersBankAccountModelSumAggregateOutputType = {
    id: number | null
    customerProfileDataModelId: number | null
  }

  export type CustomersBankAccountModelMinAggregateOutputType = {
    id: number | null
    accountHolderName: string | null
    bankAccountType: string | null
    accountNumber: string | null
    ifscCode: string | null
    bankName: string | null
    branch: string | null
    isPrimary: boolean | null
    isVerified: boolean | null
    customerProfileDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersBankAccountModelMaxAggregateOutputType = {
    id: number | null
    accountHolderName: string | null
    bankAccountType: string | null
    accountNumber: string | null
    ifscCode: string | null
    bankName: string | null
    branch: string | null
    isPrimary: boolean | null
    isVerified: boolean | null
    customerProfileDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersBankAccountModelCountAggregateOutputType = {
    id: number
    accountHolderName: number
    bankAccountType: number
    accountNumber: number
    ifscCode: number
    bankName: number
    branch: number
    isPrimary: number
    isVerified: number
    customerProfileDataModelId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomersBankAccountModelAvgAggregateInputType = {
    id?: true
    customerProfileDataModelId?: true
  }

  export type CustomersBankAccountModelSumAggregateInputType = {
    id?: true
    customerProfileDataModelId?: true
  }

  export type CustomersBankAccountModelMinAggregateInputType = {
    id?: true
    accountHolderName?: true
    bankAccountType?: true
    accountNumber?: true
    ifscCode?: true
    bankName?: true
    branch?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersBankAccountModelMaxAggregateInputType = {
    id?: true
    accountHolderName?: true
    bankAccountType?: true
    accountNumber?: true
    ifscCode?: true
    bankName?: true
    branch?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersBankAccountModelCountAggregateInputType = {
    id?: true
    accountHolderName?: true
    bankAccountType?: true
    accountNumber?: true
    ifscCode?: true
    bankName?: true
    branch?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomersBankAccountModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersBankAccountModel to aggregate.
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersBankAccountModels to fetch.
     */
    orderBy?: CustomersBankAccountModelOrderByWithRelationInput | CustomersBankAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomersBankAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersBankAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersBankAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomersBankAccountModels
    **/
    _count?: true | CustomersBankAccountModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomersBankAccountModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomersBankAccountModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomersBankAccountModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomersBankAccountModelMaxAggregateInputType
  }

  export type GetCustomersBankAccountModelAggregateType<T extends CustomersBankAccountModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomersBankAccountModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomersBankAccountModel[P]>
      : GetScalarType<T[P], AggregateCustomersBankAccountModel[P]>
  }




  export type CustomersBankAccountModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersBankAccountModelWhereInput
    orderBy?: CustomersBankAccountModelOrderByWithAggregationInput | CustomersBankAccountModelOrderByWithAggregationInput[]
    by: CustomersBankAccountModelScalarFieldEnum[] | CustomersBankAccountModelScalarFieldEnum
    having?: CustomersBankAccountModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomersBankAccountModelCountAggregateInputType | true
    _avg?: CustomersBankAccountModelAvgAggregateInputType
    _sum?: CustomersBankAccountModelSumAggregateInputType
    _min?: CustomersBankAccountModelMinAggregateInputType
    _max?: CustomersBankAccountModelMaxAggregateInputType
  }

  export type CustomersBankAccountModelGroupByOutputType = {
    id: number
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary: boolean
    isVerified: boolean
    customerProfileDataModelId: number | null
    createdAt: Date
    updatedAt: Date
    _count: CustomersBankAccountModelCountAggregateOutputType | null
    _avg: CustomersBankAccountModelAvgAggregateOutputType | null
    _sum: CustomersBankAccountModelSumAggregateOutputType | null
    _min: CustomersBankAccountModelMinAggregateOutputType | null
    _max: CustomersBankAccountModelMaxAggregateOutputType | null
  }

  type GetCustomersBankAccountModelGroupByPayload<T extends CustomersBankAccountModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomersBankAccountModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomersBankAccountModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomersBankAccountModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomersBankAccountModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomersBankAccountModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountHolderName?: boolean
    bankAccountType?: boolean
    accountNumber?: boolean
    ifscCode?: boolean
    bankName?: boolean
    branch?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersBankAccountModel"]>

  export type CustomersBankAccountModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountHolderName?: boolean
    bankAccountType?: boolean
    accountNumber?: boolean
    ifscCode?: boolean
    bankName?: boolean
    branch?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersBankAccountModel"]>

  export type CustomersBankAccountModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountHolderName?: boolean
    bankAccountType?: boolean
    accountNumber?: boolean
    ifscCode?: boolean
    bankName?: boolean
    branch?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersBankAccountModel"]>

  export type CustomersBankAccountModelSelectScalar = {
    id?: boolean
    accountHolderName?: boolean
    bankAccountType?: boolean
    accountNumber?: boolean
    ifscCode?: boolean
    bankName?: boolean
    branch?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomersBankAccountModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountHolderName" | "bankAccountType" | "accountNumber" | "ifscCode" | "bankName" | "branch" | "isPrimary" | "isVerified" | "customerProfileDataModelId" | "createdAt" | "updatedAt", ExtArgs["result"]["customersBankAccountModel"]>
  export type CustomersBankAccountModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }
  export type CustomersBankAccountModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }
  export type CustomersBankAccountModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }

  export type $CustomersBankAccountModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomersBankAccountModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Basic account info
       */
      accountHolderName: string
      bankAccountType: string
      accountNumber: string
      ifscCode: string
      bankName: string
      branch: string
      /**
       * Status flags
       */
      isPrimary: boolean
      isVerified: boolean
      customerProfileDataModelId: number | null
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customersBankAccountModel"]>
    composites: {}
  }

  type CustomersBankAccountModelGetPayload<S extends boolean | null | undefined | CustomersBankAccountModelDefaultArgs> = $Result.GetResult<Prisma.$CustomersBankAccountModelPayload, S>

  type CustomersBankAccountModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomersBankAccountModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomersBankAccountModelCountAggregateInputType | true
    }

  export interface CustomersBankAccountModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomersBankAccountModel'], meta: { name: 'CustomersBankAccountModel' } }
    /**
     * Find zero or one CustomersBankAccountModel that matches the filter.
     * @param {CustomersBankAccountModelFindUniqueArgs} args - Arguments to find a CustomersBankAccountModel
     * @example
     * // Get one CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomersBankAccountModelFindUniqueArgs>(args: SelectSubset<T, CustomersBankAccountModelFindUniqueArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomersBankAccountModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomersBankAccountModelFindUniqueOrThrowArgs} args - Arguments to find a CustomersBankAccountModel
     * @example
     * // Get one CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomersBankAccountModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomersBankAccountModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersBankAccountModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelFindFirstArgs} args - Arguments to find a CustomersBankAccountModel
     * @example
     * // Get one CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomersBankAccountModelFindFirstArgs>(args?: SelectSubset<T, CustomersBankAccountModelFindFirstArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersBankAccountModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelFindFirstOrThrowArgs} args - Arguments to find a CustomersBankAccountModel
     * @example
     * // Get one CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomersBankAccountModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomersBankAccountModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomersBankAccountModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomersBankAccountModels
     * const customersBankAccountModels = await prisma.customersBankAccountModel.findMany()
     * 
     * // Get first 10 CustomersBankAccountModels
     * const customersBankAccountModels = await prisma.customersBankAccountModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customersBankAccountModelWithIdOnly = await prisma.customersBankAccountModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomersBankAccountModelFindManyArgs>(args?: SelectSubset<T, CustomersBankAccountModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomersBankAccountModel.
     * @param {CustomersBankAccountModelCreateArgs} args - Arguments to create a CustomersBankAccountModel.
     * @example
     * // Create one CustomersBankAccountModel
     * const CustomersBankAccountModel = await prisma.customersBankAccountModel.create({
     *   data: {
     *     // ... data to create a CustomersBankAccountModel
     *   }
     * })
     * 
     */
    create<T extends CustomersBankAccountModelCreateArgs>(args: SelectSubset<T, CustomersBankAccountModelCreateArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomersBankAccountModels.
     * @param {CustomersBankAccountModelCreateManyArgs} args - Arguments to create many CustomersBankAccountModels.
     * @example
     * // Create many CustomersBankAccountModels
     * const customersBankAccountModel = await prisma.customersBankAccountModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomersBankAccountModelCreateManyArgs>(args?: SelectSubset<T, CustomersBankAccountModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomersBankAccountModels and returns the data saved in the database.
     * @param {CustomersBankAccountModelCreateManyAndReturnArgs} args - Arguments to create many CustomersBankAccountModels.
     * @example
     * // Create many CustomersBankAccountModels
     * const customersBankAccountModel = await prisma.customersBankAccountModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomersBankAccountModels and only return the `id`
     * const customersBankAccountModelWithIdOnly = await prisma.customersBankAccountModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomersBankAccountModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomersBankAccountModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomersBankAccountModel.
     * @param {CustomersBankAccountModelDeleteArgs} args - Arguments to delete one CustomersBankAccountModel.
     * @example
     * // Delete one CustomersBankAccountModel
     * const CustomersBankAccountModel = await prisma.customersBankAccountModel.delete({
     *   where: {
     *     // ... filter to delete one CustomersBankAccountModel
     *   }
     * })
     * 
     */
    delete<T extends CustomersBankAccountModelDeleteArgs>(args: SelectSubset<T, CustomersBankAccountModelDeleteArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomersBankAccountModel.
     * @param {CustomersBankAccountModelUpdateArgs} args - Arguments to update one CustomersBankAccountModel.
     * @example
     * // Update one CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomersBankAccountModelUpdateArgs>(args: SelectSubset<T, CustomersBankAccountModelUpdateArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomersBankAccountModels.
     * @param {CustomersBankAccountModelDeleteManyArgs} args - Arguments to filter CustomersBankAccountModels to delete.
     * @example
     * // Delete a few CustomersBankAccountModels
     * const { count } = await prisma.customersBankAccountModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomersBankAccountModelDeleteManyArgs>(args?: SelectSubset<T, CustomersBankAccountModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersBankAccountModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomersBankAccountModels
     * const customersBankAccountModel = await prisma.customersBankAccountModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomersBankAccountModelUpdateManyArgs>(args: SelectSubset<T, CustomersBankAccountModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersBankAccountModels and returns the data updated in the database.
     * @param {CustomersBankAccountModelUpdateManyAndReturnArgs} args - Arguments to update many CustomersBankAccountModels.
     * @example
     * // Update many CustomersBankAccountModels
     * const customersBankAccountModel = await prisma.customersBankAccountModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomersBankAccountModels and only return the `id`
     * const customersBankAccountModelWithIdOnly = await prisma.customersBankAccountModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomersBankAccountModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomersBankAccountModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomersBankAccountModel.
     * @param {CustomersBankAccountModelUpsertArgs} args - Arguments to update or create a CustomersBankAccountModel.
     * @example
     * // Update or create a CustomersBankAccountModel
     * const customersBankAccountModel = await prisma.customersBankAccountModel.upsert({
     *   create: {
     *     // ... data to create a CustomersBankAccountModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomersBankAccountModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomersBankAccountModelUpsertArgs>(args: SelectSubset<T, CustomersBankAccountModelUpsertArgs<ExtArgs>>): Prisma__CustomersBankAccountModelClient<$Result.GetResult<Prisma.$CustomersBankAccountModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomersBankAccountModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelCountArgs} args - Arguments to filter CustomersBankAccountModels to count.
     * @example
     * // Count the number of CustomersBankAccountModels
     * const count = await prisma.customersBankAccountModel.count({
     *   where: {
     *     // ... the filter for the CustomersBankAccountModels we want to count
     *   }
     * })
    **/
    count<T extends CustomersBankAccountModelCountArgs>(
      args?: Subset<T, CustomersBankAccountModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomersBankAccountModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomersBankAccountModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomersBankAccountModelAggregateArgs>(args: Subset<T, CustomersBankAccountModelAggregateArgs>): Prisma.PrismaPromise<GetCustomersBankAccountModelAggregateType<T>>

    /**
     * Group by CustomersBankAccountModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersBankAccountModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomersBankAccountModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomersBankAccountModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomersBankAccountModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomersBankAccountModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomersBankAccountModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomersBankAccountModel model
   */
  readonly fields: CustomersBankAccountModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomersBankAccountModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomersBankAccountModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomersBankAccountModel model
   */
  interface CustomersBankAccountModelFieldRefs {
    readonly id: FieldRef<"CustomersBankAccountModel", 'Int'>
    readonly accountHolderName: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly bankAccountType: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly accountNumber: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly ifscCode: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly bankName: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly branch: FieldRef<"CustomersBankAccountModel", 'String'>
    readonly isPrimary: FieldRef<"CustomersBankAccountModel", 'Boolean'>
    readonly isVerified: FieldRef<"CustomersBankAccountModel", 'Boolean'>
    readonly customerProfileDataModelId: FieldRef<"CustomersBankAccountModel", 'Int'>
    readonly createdAt: FieldRef<"CustomersBankAccountModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomersBankAccountModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomersBankAccountModel findUnique
   */
  export type CustomersBankAccountModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersBankAccountModel to fetch.
     */
    where: CustomersBankAccountModelWhereUniqueInput
  }

  /**
   * CustomersBankAccountModel findUniqueOrThrow
   */
  export type CustomersBankAccountModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersBankAccountModel to fetch.
     */
    where: CustomersBankAccountModelWhereUniqueInput
  }

  /**
   * CustomersBankAccountModel findFirst
   */
  export type CustomersBankAccountModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersBankAccountModel to fetch.
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersBankAccountModels to fetch.
     */
    orderBy?: CustomersBankAccountModelOrderByWithRelationInput | CustomersBankAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersBankAccountModels.
     */
    cursor?: CustomersBankAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersBankAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersBankAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersBankAccountModels.
     */
    distinct?: CustomersBankAccountModelScalarFieldEnum | CustomersBankAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersBankAccountModel findFirstOrThrow
   */
  export type CustomersBankAccountModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersBankAccountModel to fetch.
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersBankAccountModels to fetch.
     */
    orderBy?: CustomersBankAccountModelOrderByWithRelationInput | CustomersBankAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersBankAccountModels.
     */
    cursor?: CustomersBankAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersBankAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersBankAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersBankAccountModels.
     */
    distinct?: CustomersBankAccountModelScalarFieldEnum | CustomersBankAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersBankAccountModel findMany
   */
  export type CustomersBankAccountModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersBankAccountModels to fetch.
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersBankAccountModels to fetch.
     */
    orderBy?: CustomersBankAccountModelOrderByWithRelationInput | CustomersBankAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomersBankAccountModels.
     */
    cursor?: CustomersBankAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersBankAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersBankAccountModels.
     */
    skip?: number
    distinct?: CustomersBankAccountModelScalarFieldEnum | CustomersBankAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersBankAccountModel create
   */
  export type CustomersBankAccountModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomersBankAccountModel.
     */
    data: XOR<CustomersBankAccountModelCreateInput, CustomersBankAccountModelUncheckedCreateInput>
  }

  /**
   * CustomersBankAccountModel createMany
   */
  export type CustomersBankAccountModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomersBankAccountModels.
     */
    data: CustomersBankAccountModelCreateManyInput | CustomersBankAccountModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersBankAccountModel createManyAndReturn
   */
  export type CustomersBankAccountModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomersBankAccountModels.
     */
    data: CustomersBankAccountModelCreateManyInput | CustomersBankAccountModelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomersBankAccountModel update
   */
  export type CustomersBankAccountModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomersBankAccountModel.
     */
    data: XOR<CustomersBankAccountModelUpdateInput, CustomersBankAccountModelUncheckedUpdateInput>
    /**
     * Choose, which CustomersBankAccountModel to update.
     */
    where: CustomersBankAccountModelWhereUniqueInput
  }

  /**
   * CustomersBankAccountModel updateMany
   */
  export type CustomersBankAccountModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomersBankAccountModels.
     */
    data: XOR<CustomersBankAccountModelUpdateManyMutationInput, CustomersBankAccountModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersBankAccountModels to update
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * Limit how many CustomersBankAccountModels to update.
     */
    limit?: number
  }

  /**
   * CustomersBankAccountModel updateManyAndReturn
   */
  export type CustomersBankAccountModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomersBankAccountModels.
     */
    data: XOR<CustomersBankAccountModelUpdateManyMutationInput, CustomersBankAccountModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersBankAccountModels to update
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * Limit how many CustomersBankAccountModels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomersBankAccountModel upsert
   */
  export type CustomersBankAccountModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomersBankAccountModel to update in case it exists.
     */
    where: CustomersBankAccountModelWhereUniqueInput
    /**
     * In case the CustomersBankAccountModel found by the `where` argument doesn't exist, create a new CustomersBankAccountModel with this data.
     */
    create: XOR<CustomersBankAccountModelCreateInput, CustomersBankAccountModelUncheckedCreateInput>
    /**
     * In case the CustomersBankAccountModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomersBankAccountModelUpdateInput, CustomersBankAccountModelUncheckedUpdateInput>
  }

  /**
   * CustomersBankAccountModel delete
   */
  export type CustomersBankAccountModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
    /**
     * Filter which CustomersBankAccountModel to delete.
     */
    where: CustomersBankAccountModelWhereUniqueInput
  }

  /**
   * CustomersBankAccountModel deleteMany
   */
  export type CustomersBankAccountModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersBankAccountModels to delete
     */
    where?: CustomersBankAccountModelWhereInput
    /**
     * Limit how many CustomersBankAccountModels to delete.
     */
    limit?: number
  }

  /**
   * CustomersBankAccountModel.CustomerProfileDataModel
   */
  export type CustomersBankAccountModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
  }

  /**
   * CustomersBankAccountModel without action
   */
  export type CustomersBankAccountModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersBankAccountModel
     */
    select?: CustomersBankAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersBankAccountModel
     */
    omit?: CustomersBankAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersBankAccountModelInclude<ExtArgs> | null
  }


  /**
   * Model CustomersDematAccountModel
   */

  export type AggregateCustomersDematAccountModel = {
    _count: CustomersDematAccountModelCountAggregateOutputType | null
    _avg: CustomersDematAccountModelAvgAggregateOutputType | null
    _sum: CustomersDematAccountModelSumAggregateOutputType | null
    _min: CustomersDematAccountModelMinAggregateOutputType | null
    _max: CustomersDematAccountModelMaxAggregateOutputType | null
  }

  export type CustomersDematAccountModelAvgAggregateOutputType = {
    id: number | null
    customerProfileDataModelId: number | null
  }

  export type CustomersDematAccountModelSumAggregateOutputType = {
    id: number | null
    customerProfileDataModelId: number | null
  }

  export type CustomersDematAccountModelMinAggregateOutputType = {
    id: number | null
    depositoryName: $Enums.DepositoryName | null
    dpId: string | null
    clientId: string | null
    accountType: $Enums.DematAccountType | null
    depositoryParticipantName: string | null
    primaryPanNumber: string | null
    sndPanNumber: string | null
    trdPanNumber: string | null
    accountHolderName: string | null
    isPrimary: boolean | null
    isVerified: boolean | null
    customerProfileDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersDematAccountModelMaxAggregateOutputType = {
    id: number | null
    depositoryName: $Enums.DepositoryName | null
    dpId: string | null
    clientId: string | null
    accountType: $Enums.DematAccountType | null
    depositoryParticipantName: string | null
    primaryPanNumber: string | null
    sndPanNumber: string | null
    trdPanNumber: string | null
    accountHolderName: string | null
    isPrimary: boolean | null
    isVerified: boolean | null
    customerProfileDataModelId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersDematAccountModelCountAggregateOutputType = {
    id: number
    depositoryName: number
    dpId: number
    clientId: number
    accountType: number
    depositoryParticipantName: number
    primaryPanNumber: number
    sndPanNumber: number
    trdPanNumber: number
    accountHolderName: number
    isPrimary: number
    isVerified: number
    customerProfileDataModelId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomersDematAccountModelAvgAggregateInputType = {
    id?: true
    customerProfileDataModelId?: true
  }

  export type CustomersDematAccountModelSumAggregateInputType = {
    id?: true
    customerProfileDataModelId?: true
  }

  export type CustomersDematAccountModelMinAggregateInputType = {
    id?: true
    depositoryName?: true
    dpId?: true
    clientId?: true
    accountType?: true
    depositoryParticipantName?: true
    primaryPanNumber?: true
    sndPanNumber?: true
    trdPanNumber?: true
    accountHolderName?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersDematAccountModelMaxAggregateInputType = {
    id?: true
    depositoryName?: true
    dpId?: true
    clientId?: true
    accountType?: true
    depositoryParticipantName?: true
    primaryPanNumber?: true
    sndPanNumber?: true
    trdPanNumber?: true
    accountHolderName?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersDematAccountModelCountAggregateInputType = {
    id?: true
    depositoryName?: true
    dpId?: true
    clientId?: true
    accountType?: true
    depositoryParticipantName?: true
    primaryPanNumber?: true
    sndPanNumber?: true
    trdPanNumber?: true
    accountHolderName?: true
    isPrimary?: true
    isVerified?: true
    customerProfileDataModelId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomersDematAccountModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersDematAccountModel to aggregate.
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersDematAccountModels to fetch.
     */
    orderBy?: CustomersDematAccountModelOrderByWithRelationInput | CustomersDematAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomersDematAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersDematAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersDematAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomersDematAccountModels
    **/
    _count?: true | CustomersDematAccountModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomersDematAccountModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomersDematAccountModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomersDematAccountModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomersDematAccountModelMaxAggregateInputType
  }

  export type GetCustomersDematAccountModelAggregateType<T extends CustomersDematAccountModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomersDematAccountModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomersDematAccountModel[P]>
      : GetScalarType<T[P], AggregateCustomersDematAccountModel[P]>
  }




  export type CustomersDematAccountModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersDematAccountModelWhereInput
    orderBy?: CustomersDematAccountModelOrderByWithAggregationInput | CustomersDematAccountModelOrderByWithAggregationInput[]
    by: CustomersDematAccountModelScalarFieldEnum[] | CustomersDematAccountModelScalarFieldEnum
    having?: CustomersDematAccountModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomersDematAccountModelCountAggregateInputType | true
    _avg?: CustomersDematAccountModelAvgAggregateInputType
    _sum?: CustomersDematAccountModelSumAggregateInputType
    _min?: CustomersDematAccountModelMinAggregateInputType
    _max?: CustomersDematAccountModelMaxAggregateInputType
  }

  export type CustomersDematAccountModelGroupByOutputType = {
    id: number
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber: string | null
    trdPanNumber: string | null
    accountHolderName: string
    isPrimary: boolean
    isVerified: boolean
    customerProfileDataModelId: number | null
    createdAt: Date
    updatedAt: Date
    _count: CustomersDematAccountModelCountAggregateOutputType | null
    _avg: CustomersDematAccountModelAvgAggregateOutputType | null
    _sum: CustomersDematAccountModelSumAggregateOutputType | null
    _min: CustomersDematAccountModelMinAggregateOutputType | null
    _max: CustomersDematAccountModelMaxAggregateOutputType | null
  }

  type GetCustomersDematAccountModelGroupByPayload<T extends CustomersDematAccountModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomersDematAccountModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomersDematAccountModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomersDematAccountModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomersDematAccountModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomersDematAccountModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    depositoryName?: boolean
    dpId?: boolean
    clientId?: boolean
    accountType?: boolean
    depositoryParticipantName?: boolean
    primaryPanNumber?: boolean
    sndPanNumber?: boolean
    trdPanNumber?: boolean
    accountHolderName?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersDematAccountModel"]>

  export type CustomersDematAccountModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    depositoryName?: boolean
    dpId?: boolean
    clientId?: boolean
    accountType?: boolean
    depositoryParticipantName?: boolean
    primaryPanNumber?: boolean
    sndPanNumber?: boolean
    trdPanNumber?: boolean
    accountHolderName?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersDematAccountModel"]>

  export type CustomersDematAccountModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    depositoryName?: boolean
    dpId?: boolean
    clientId?: boolean
    accountType?: boolean
    depositoryParticipantName?: boolean
    primaryPanNumber?: boolean
    sndPanNumber?: boolean
    trdPanNumber?: boolean
    accountHolderName?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }, ExtArgs["result"]["customersDematAccountModel"]>

  export type CustomersDematAccountModelSelectScalar = {
    id?: boolean
    depositoryName?: boolean
    dpId?: boolean
    clientId?: boolean
    accountType?: boolean
    depositoryParticipantName?: boolean
    primaryPanNumber?: boolean
    sndPanNumber?: boolean
    trdPanNumber?: boolean
    accountHolderName?: boolean
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomersDematAccountModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "depositoryName" | "dpId" | "clientId" | "accountType" | "depositoryParticipantName" | "primaryPanNumber" | "sndPanNumber" | "trdPanNumber" | "accountHolderName" | "isPrimary" | "isVerified" | "customerProfileDataModelId" | "createdAt" | "updatedAt", ExtArgs["result"]["customersDematAccountModel"]>
  export type CustomersDematAccountModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }
  export type CustomersDematAccountModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }
  export type CustomersDematAccountModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    CustomerProfileDataModel?: boolean | CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>
  }

  export type $CustomersDematAccountModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomersDematAccountModel"
    objects: {
      CustomerProfileDataModel: Prisma.$CustomerProfileDataModelPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Depository info
       */
      depositoryName: $Enums.DepositoryName
      dpId: string
      clientId: string
      accountType: $Enums.DematAccountType
      depositoryParticipantName: string
      /**
       * PAN details linked to this account
       */
      primaryPanNumber: string
      sndPanNumber: string | null
      trdPanNumber: string | null
      accountHolderName: string
      /**
       * Status flags
       */
      isPrimary: boolean
      isVerified: boolean
      customerProfileDataModelId: number | null
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customersDematAccountModel"]>
    composites: {}
  }

  type CustomersDematAccountModelGetPayload<S extends boolean | null | undefined | CustomersDematAccountModelDefaultArgs> = $Result.GetResult<Prisma.$CustomersDematAccountModelPayload, S>

  type CustomersDematAccountModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomersDematAccountModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomersDematAccountModelCountAggregateInputType | true
    }

  export interface CustomersDematAccountModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomersDematAccountModel'], meta: { name: 'CustomersDematAccountModel' } }
    /**
     * Find zero or one CustomersDematAccountModel that matches the filter.
     * @param {CustomersDematAccountModelFindUniqueArgs} args - Arguments to find a CustomersDematAccountModel
     * @example
     * // Get one CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomersDematAccountModelFindUniqueArgs>(args: SelectSubset<T, CustomersDematAccountModelFindUniqueArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomersDematAccountModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomersDematAccountModelFindUniqueOrThrowArgs} args - Arguments to find a CustomersDematAccountModel
     * @example
     * // Get one CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomersDematAccountModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomersDematAccountModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersDematAccountModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelFindFirstArgs} args - Arguments to find a CustomersDematAccountModel
     * @example
     * // Get one CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomersDematAccountModelFindFirstArgs>(args?: SelectSubset<T, CustomersDematAccountModelFindFirstArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersDematAccountModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelFindFirstOrThrowArgs} args - Arguments to find a CustomersDematAccountModel
     * @example
     * // Get one CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomersDematAccountModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomersDematAccountModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomersDematAccountModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomersDematAccountModels
     * const customersDematAccountModels = await prisma.customersDematAccountModel.findMany()
     * 
     * // Get first 10 CustomersDematAccountModels
     * const customersDematAccountModels = await prisma.customersDematAccountModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customersDematAccountModelWithIdOnly = await prisma.customersDematAccountModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomersDematAccountModelFindManyArgs>(args?: SelectSubset<T, CustomersDematAccountModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomersDematAccountModel.
     * @param {CustomersDematAccountModelCreateArgs} args - Arguments to create a CustomersDematAccountModel.
     * @example
     * // Create one CustomersDematAccountModel
     * const CustomersDematAccountModel = await prisma.customersDematAccountModel.create({
     *   data: {
     *     // ... data to create a CustomersDematAccountModel
     *   }
     * })
     * 
     */
    create<T extends CustomersDematAccountModelCreateArgs>(args: SelectSubset<T, CustomersDematAccountModelCreateArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomersDematAccountModels.
     * @param {CustomersDematAccountModelCreateManyArgs} args - Arguments to create many CustomersDematAccountModels.
     * @example
     * // Create many CustomersDematAccountModels
     * const customersDematAccountModel = await prisma.customersDematAccountModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomersDematAccountModelCreateManyArgs>(args?: SelectSubset<T, CustomersDematAccountModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomersDematAccountModels and returns the data saved in the database.
     * @param {CustomersDematAccountModelCreateManyAndReturnArgs} args - Arguments to create many CustomersDematAccountModels.
     * @example
     * // Create many CustomersDematAccountModels
     * const customersDematAccountModel = await prisma.customersDematAccountModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomersDematAccountModels and only return the `id`
     * const customersDematAccountModelWithIdOnly = await prisma.customersDematAccountModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomersDematAccountModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomersDematAccountModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomersDematAccountModel.
     * @param {CustomersDematAccountModelDeleteArgs} args - Arguments to delete one CustomersDematAccountModel.
     * @example
     * // Delete one CustomersDematAccountModel
     * const CustomersDematAccountModel = await prisma.customersDematAccountModel.delete({
     *   where: {
     *     // ... filter to delete one CustomersDematAccountModel
     *   }
     * })
     * 
     */
    delete<T extends CustomersDematAccountModelDeleteArgs>(args: SelectSubset<T, CustomersDematAccountModelDeleteArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomersDematAccountModel.
     * @param {CustomersDematAccountModelUpdateArgs} args - Arguments to update one CustomersDematAccountModel.
     * @example
     * // Update one CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomersDematAccountModelUpdateArgs>(args: SelectSubset<T, CustomersDematAccountModelUpdateArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomersDematAccountModels.
     * @param {CustomersDematAccountModelDeleteManyArgs} args - Arguments to filter CustomersDematAccountModels to delete.
     * @example
     * // Delete a few CustomersDematAccountModels
     * const { count } = await prisma.customersDematAccountModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomersDematAccountModelDeleteManyArgs>(args?: SelectSubset<T, CustomersDematAccountModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersDematAccountModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomersDematAccountModels
     * const customersDematAccountModel = await prisma.customersDematAccountModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomersDematAccountModelUpdateManyArgs>(args: SelectSubset<T, CustomersDematAccountModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersDematAccountModels and returns the data updated in the database.
     * @param {CustomersDematAccountModelUpdateManyAndReturnArgs} args - Arguments to update many CustomersDematAccountModels.
     * @example
     * // Update many CustomersDematAccountModels
     * const customersDematAccountModel = await prisma.customersDematAccountModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomersDematAccountModels and only return the `id`
     * const customersDematAccountModelWithIdOnly = await prisma.customersDematAccountModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomersDematAccountModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomersDematAccountModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomersDematAccountModel.
     * @param {CustomersDematAccountModelUpsertArgs} args - Arguments to update or create a CustomersDematAccountModel.
     * @example
     * // Update or create a CustomersDematAccountModel
     * const customersDematAccountModel = await prisma.customersDematAccountModel.upsert({
     *   create: {
     *     // ... data to create a CustomersDematAccountModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomersDematAccountModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomersDematAccountModelUpsertArgs>(args: SelectSubset<T, CustomersDematAccountModelUpsertArgs<ExtArgs>>): Prisma__CustomersDematAccountModelClient<$Result.GetResult<Prisma.$CustomersDematAccountModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomersDematAccountModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelCountArgs} args - Arguments to filter CustomersDematAccountModels to count.
     * @example
     * // Count the number of CustomersDematAccountModels
     * const count = await prisma.customersDematAccountModel.count({
     *   where: {
     *     // ... the filter for the CustomersDematAccountModels we want to count
     *   }
     * })
    **/
    count<T extends CustomersDematAccountModelCountArgs>(
      args?: Subset<T, CustomersDematAccountModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomersDematAccountModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomersDematAccountModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomersDematAccountModelAggregateArgs>(args: Subset<T, CustomersDematAccountModelAggregateArgs>): Prisma.PrismaPromise<GetCustomersDematAccountModelAggregateType<T>>

    /**
     * Group by CustomersDematAccountModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersDematAccountModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomersDematAccountModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomersDematAccountModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomersDematAccountModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomersDematAccountModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomersDematAccountModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomersDematAccountModel model
   */
  readonly fields: CustomersDematAccountModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomersDematAccountModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomersDematAccountModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    CustomerProfileDataModel<T extends CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs> = {}>(args?: Subset<T, CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs>>): Prisma__CustomerProfileDataModelClient<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomersDematAccountModel model
   */
  interface CustomersDematAccountModelFieldRefs {
    readonly id: FieldRef<"CustomersDematAccountModel", 'Int'>
    readonly depositoryName: FieldRef<"CustomersDematAccountModel", 'DepositoryName'>
    readonly dpId: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly clientId: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly accountType: FieldRef<"CustomersDematAccountModel", 'DematAccountType'>
    readonly depositoryParticipantName: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly primaryPanNumber: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly sndPanNumber: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly trdPanNumber: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly accountHolderName: FieldRef<"CustomersDematAccountModel", 'String'>
    readonly isPrimary: FieldRef<"CustomersDematAccountModel", 'Boolean'>
    readonly isVerified: FieldRef<"CustomersDematAccountModel", 'Boolean'>
    readonly customerProfileDataModelId: FieldRef<"CustomersDematAccountModel", 'Int'>
    readonly createdAt: FieldRef<"CustomersDematAccountModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomersDematAccountModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomersDematAccountModel findUnique
   */
  export type CustomersDematAccountModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersDematAccountModel to fetch.
     */
    where: CustomersDematAccountModelWhereUniqueInput
  }

  /**
   * CustomersDematAccountModel findUniqueOrThrow
   */
  export type CustomersDematAccountModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersDematAccountModel to fetch.
     */
    where: CustomersDematAccountModelWhereUniqueInput
  }

  /**
   * CustomersDematAccountModel findFirst
   */
  export type CustomersDematAccountModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersDematAccountModel to fetch.
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersDematAccountModels to fetch.
     */
    orderBy?: CustomersDematAccountModelOrderByWithRelationInput | CustomersDematAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersDematAccountModels.
     */
    cursor?: CustomersDematAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersDematAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersDematAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersDematAccountModels.
     */
    distinct?: CustomersDematAccountModelScalarFieldEnum | CustomersDematAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersDematAccountModel findFirstOrThrow
   */
  export type CustomersDematAccountModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersDematAccountModel to fetch.
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersDematAccountModels to fetch.
     */
    orderBy?: CustomersDematAccountModelOrderByWithRelationInput | CustomersDematAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersDematAccountModels.
     */
    cursor?: CustomersDematAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersDematAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersDematAccountModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersDematAccountModels.
     */
    distinct?: CustomersDematAccountModelScalarFieldEnum | CustomersDematAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersDematAccountModel findMany
   */
  export type CustomersDematAccountModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter, which CustomersDematAccountModels to fetch.
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersDematAccountModels to fetch.
     */
    orderBy?: CustomersDematAccountModelOrderByWithRelationInput | CustomersDematAccountModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomersDematAccountModels.
     */
    cursor?: CustomersDematAccountModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersDematAccountModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersDematAccountModels.
     */
    skip?: number
    distinct?: CustomersDematAccountModelScalarFieldEnum | CustomersDematAccountModelScalarFieldEnum[]
  }

  /**
   * CustomersDematAccountModel create
   */
  export type CustomersDematAccountModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CustomersDematAccountModel.
     */
    data: XOR<CustomersDematAccountModelCreateInput, CustomersDematAccountModelUncheckedCreateInput>
  }

  /**
   * CustomersDematAccountModel createMany
   */
  export type CustomersDematAccountModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomersDematAccountModels.
     */
    data: CustomersDematAccountModelCreateManyInput | CustomersDematAccountModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersDematAccountModel createManyAndReturn
   */
  export type CustomersDematAccountModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomersDematAccountModels.
     */
    data: CustomersDematAccountModelCreateManyInput | CustomersDematAccountModelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomersDematAccountModel update
   */
  export type CustomersDematAccountModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CustomersDematAccountModel.
     */
    data: XOR<CustomersDematAccountModelUpdateInput, CustomersDematAccountModelUncheckedUpdateInput>
    /**
     * Choose, which CustomersDematAccountModel to update.
     */
    where: CustomersDematAccountModelWhereUniqueInput
  }

  /**
   * CustomersDematAccountModel updateMany
   */
  export type CustomersDematAccountModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomersDematAccountModels.
     */
    data: XOR<CustomersDematAccountModelUpdateManyMutationInput, CustomersDematAccountModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersDematAccountModels to update
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * Limit how many CustomersDematAccountModels to update.
     */
    limit?: number
  }

  /**
   * CustomersDematAccountModel updateManyAndReturn
   */
  export type CustomersDematAccountModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomersDematAccountModels.
     */
    data: XOR<CustomersDematAccountModelUpdateManyMutationInput, CustomersDematAccountModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersDematAccountModels to update
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * Limit how many CustomersDematAccountModels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CustomersDematAccountModel upsert
   */
  export type CustomersDematAccountModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CustomersDematAccountModel to update in case it exists.
     */
    where: CustomersDematAccountModelWhereUniqueInput
    /**
     * In case the CustomersDematAccountModel found by the `where` argument doesn't exist, create a new CustomersDematAccountModel with this data.
     */
    create: XOR<CustomersDematAccountModelCreateInput, CustomersDematAccountModelUncheckedCreateInput>
    /**
     * In case the CustomersDematAccountModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomersDematAccountModelUpdateInput, CustomersDematAccountModelUncheckedUpdateInput>
  }

  /**
   * CustomersDematAccountModel delete
   */
  export type CustomersDematAccountModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
    /**
     * Filter which CustomersDematAccountModel to delete.
     */
    where: CustomersDematAccountModelWhereUniqueInput
  }

  /**
   * CustomersDematAccountModel deleteMany
   */
  export type CustomersDematAccountModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersDematAccountModels to delete
     */
    where?: CustomersDematAccountModelWhereInput
    /**
     * Limit how many CustomersDematAccountModels to delete.
     */
    limit?: number
  }

  /**
   * CustomersDematAccountModel.CustomerProfileDataModel
   */
  export type CustomersDematAccountModel$CustomerProfileDataModelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
  }

  /**
   * CustomersDematAccountModel without action
   */
  export type CustomersDematAccountModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersDematAccountModel
     */
    select?: CustomersDematAccountModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersDematAccountModel
     */
    omit?: CustomersDematAccountModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomersDematAccountModelInclude<ExtArgs> | null
  }


  /**
   * Model CustomersRiskProfileModel
   */

  export type AggregateCustomersRiskProfileModel = {
    _count: CustomersRiskProfileModelCountAggregateOutputType | null
    _avg: CustomersRiskProfileModelAvgAggregateOutputType | null
    _sum: CustomersRiskProfileModelSumAggregateOutputType | null
    _min: CustomersRiskProfileModelMinAggregateOutputType | null
    _max: CustomersRiskProfileModelMaxAggregateOutputType | null
  }

  export type CustomersRiskProfileModelAvgAggregateOutputType = {
    id: number | null
  }

  export type CustomersRiskProfileModelSumAggregateOutputType = {
    id: number | null
  }

  export type CustomersRiskProfileModelMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersRiskProfileModelMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustomersRiskProfileModelCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustomersRiskProfileModelAvgAggregateInputType = {
    id?: true
  }

  export type CustomersRiskProfileModelSumAggregateInputType = {
    id?: true
  }

  export type CustomersRiskProfileModelMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersRiskProfileModelMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustomersRiskProfileModelCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustomersRiskProfileModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersRiskProfileModel to aggregate.
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersRiskProfileModels to fetch.
     */
    orderBy?: CustomersRiskProfileModelOrderByWithRelationInput | CustomersRiskProfileModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomersRiskProfileModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersRiskProfileModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersRiskProfileModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustomersRiskProfileModels
    **/
    _count?: true | CustomersRiskProfileModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CustomersRiskProfileModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CustomersRiskProfileModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomersRiskProfileModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomersRiskProfileModelMaxAggregateInputType
  }

  export type GetCustomersRiskProfileModelAggregateType<T extends CustomersRiskProfileModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomersRiskProfileModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomersRiskProfileModel[P]>
      : GetScalarType<T[P], AggregateCustomersRiskProfileModel[P]>
  }




  export type CustomersRiskProfileModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomersRiskProfileModelWhereInput
    orderBy?: CustomersRiskProfileModelOrderByWithAggregationInput | CustomersRiskProfileModelOrderByWithAggregationInput[]
    by: CustomersRiskProfileModelScalarFieldEnum[] | CustomersRiskProfileModelScalarFieldEnum
    having?: CustomersRiskProfileModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomersRiskProfileModelCountAggregateInputType | true
    _avg?: CustomersRiskProfileModelAvgAggregateInputType
    _sum?: CustomersRiskProfileModelSumAggregateInputType
    _min?: CustomersRiskProfileModelMinAggregateInputType
    _max?: CustomersRiskProfileModelMaxAggregateInputType
  }

  export type CustomersRiskProfileModelGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    _count: CustomersRiskProfileModelCountAggregateOutputType | null
    _avg: CustomersRiskProfileModelAvgAggregateOutputType | null
    _sum: CustomersRiskProfileModelSumAggregateOutputType | null
    _min: CustomersRiskProfileModelMinAggregateOutputType | null
    _max: CustomersRiskProfileModelMaxAggregateOutputType | null
  }

  type GetCustomersRiskProfileModelGroupByPayload<T extends CustomersRiskProfileModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomersRiskProfileModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomersRiskProfileModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomersRiskProfileModelGroupByOutputType[P]>
            : GetScalarType<T[P], CustomersRiskProfileModelGroupByOutputType[P]>
        }
      >
    >


  export type CustomersRiskProfileModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customersRiskProfileModel"]>

  export type CustomersRiskProfileModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customersRiskProfileModel"]>

  export type CustomersRiskProfileModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["customersRiskProfileModel"]>

  export type CustomersRiskProfileModelSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustomersRiskProfileModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt", ExtArgs["result"]["customersRiskProfileModel"]>

  export type $CustomersRiskProfileModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustomersRiskProfileModel"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["customersRiskProfileModel"]>
    composites: {}
  }

  type CustomersRiskProfileModelGetPayload<S extends boolean | null | undefined | CustomersRiskProfileModelDefaultArgs> = $Result.GetResult<Prisma.$CustomersRiskProfileModelPayload, S>

  type CustomersRiskProfileModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomersRiskProfileModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomersRiskProfileModelCountAggregateInputType | true
    }

  export interface CustomersRiskProfileModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustomersRiskProfileModel'], meta: { name: 'CustomersRiskProfileModel' } }
    /**
     * Find zero or one CustomersRiskProfileModel that matches the filter.
     * @param {CustomersRiskProfileModelFindUniqueArgs} args - Arguments to find a CustomersRiskProfileModel
     * @example
     * // Get one CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomersRiskProfileModelFindUniqueArgs>(args: SelectSubset<T, CustomersRiskProfileModelFindUniqueArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustomersRiskProfileModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomersRiskProfileModelFindUniqueOrThrowArgs} args - Arguments to find a CustomersRiskProfileModel
     * @example
     * // Get one CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomersRiskProfileModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomersRiskProfileModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersRiskProfileModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelFindFirstArgs} args - Arguments to find a CustomersRiskProfileModel
     * @example
     * // Get one CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomersRiskProfileModelFindFirstArgs>(args?: SelectSubset<T, CustomersRiskProfileModelFindFirstArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustomersRiskProfileModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelFindFirstOrThrowArgs} args - Arguments to find a CustomersRiskProfileModel
     * @example
     * // Get one CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomersRiskProfileModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomersRiskProfileModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustomersRiskProfileModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustomersRiskProfileModels
     * const customersRiskProfileModels = await prisma.customersRiskProfileModel.findMany()
     * 
     * // Get first 10 CustomersRiskProfileModels
     * const customersRiskProfileModels = await prisma.customersRiskProfileModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customersRiskProfileModelWithIdOnly = await prisma.customersRiskProfileModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomersRiskProfileModelFindManyArgs>(args?: SelectSubset<T, CustomersRiskProfileModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustomersRiskProfileModel.
     * @param {CustomersRiskProfileModelCreateArgs} args - Arguments to create a CustomersRiskProfileModel.
     * @example
     * // Create one CustomersRiskProfileModel
     * const CustomersRiskProfileModel = await prisma.customersRiskProfileModel.create({
     *   data: {
     *     // ... data to create a CustomersRiskProfileModel
     *   }
     * })
     * 
     */
    create<T extends CustomersRiskProfileModelCreateArgs>(args: SelectSubset<T, CustomersRiskProfileModelCreateArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustomersRiskProfileModels.
     * @param {CustomersRiskProfileModelCreateManyArgs} args - Arguments to create many CustomersRiskProfileModels.
     * @example
     * // Create many CustomersRiskProfileModels
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomersRiskProfileModelCreateManyArgs>(args?: SelectSubset<T, CustomersRiskProfileModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustomersRiskProfileModels and returns the data saved in the database.
     * @param {CustomersRiskProfileModelCreateManyAndReturnArgs} args - Arguments to create many CustomersRiskProfileModels.
     * @example
     * // Create many CustomersRiskProfileModels
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustomersRiskProfileModels and only return the `id`
     * const customersRiskProfileModelWithIdOnly = await prisma.customersRiskProfileModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomersRiskProfileModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomersRiskProfileModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustomersRiskProfileModel.
     * @param {CustomersRiskProfileModelDeleteArgs} args - Arguments to delete one CustomersRiskProfileModel.
     * @example
     * // Delete one CustomersRiskProfileModel
     * const CustomersRiskProfileModel = await prisma.customersRiskProfileModel.delete({
     *   where: {
     *     // ... filter to delete one CustomersRiskProfileModel
     *   }
     * })
     * 
     */
    delete<T extends CustomersRiskProfileModelDeleteArgs>(args: SelectSubset<T, CustomersRiskProfileModelDeleteArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustomersRiskProfileModel.
     * @param {CustomersRiskProfileModelUpdateArgs} args - Arguments to update one CustomersRiskProfileModel.
     * @example
     * // Update one CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomersRiskProfileModelUpdateArgs>(args: SelectSubset<T, CustomersRiskProfileModelUpdateArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustomersRiskProfileModels.
     * @param {CustomersRiskProfileModelDeleteManyArgs} args - Arguments to filter CustomersRiskProfileModels to delete.
     * @example
     * // Delete a few CustomersRiskProfileModels
     * const { count } = await prisma.customersRiskProfileModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomersRiskProfileModelDeleteManyArgs>(args?: SelectSubset<T, CustomersRiskProfileModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersRiskProfileModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustomersRiskProfileModels
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomersRiskProfileModelUpdateManyArgs>(args: SelectSubset<T, CustomersRiskProfileModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustomersRiskProfileModels and returns the data updated in the database.
     * @param {CustomersRiskProfileModelUpdateManyAndReturnArgs} args - Arguments to update many CustomersRiskProfileModels.
     * @example
     * // Update many CustomersRiskProfileModels
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustomersRiskProfileModels and only return the `id`
     * const customersRiskProfileModelWithIdOnly = await prisma.customersRiskProfileModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomersRiskProfileModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomersRiskProfileModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustomersRiskProfileModel.
     * @param {CustomersRiskProfileModelUpsertArgs} args - Arguments to update or create a CustomersRiskProfileModel.
     * @example
     * // Update or create a CustomersRiskProfileModel
     * const customersRiskProfileModel = await prisma.customersRiskProfileModel.upsert({
     *   create: {
     *     // ... data to create a CustomersRiskProfileModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustomersRiskProfileModel we want to update
     *   }
     * })
     */
    upsert<T extends CustomersRiskProfileModelUpsertArgs>(args: SelectSubset<T, CustomersRiskProfileModelUpsertArgs<ExtArgs>>): Prisma__CustomersRiskProfileModelClient<$Result.GetResult<Prisma.$CustomersRiskProfileModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustomersRiskProfileModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelCountArgs} args - Arguments to filter CustomersRiskProfileModels to count.
     * @example
     * // Count the number of CustomersRiskProfileModels
     * const count = await prisma.customersRiskProfileModel.count({
     *   where: {
     *     // ... the filter for the CustomersRiskProfileModels we want to count
     *   }
     * })
    **/
    count<T extends CustomersRiskProfileModelCountArgs>(
      args?: Subset<T, CustomersRiskProfileModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomersRiskProfileModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustomersRiskProfileModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomersRiskProfileModelAggregateArgs>(args: Subset<T, CustomersRiskProfileModelAggregateArgs>): Prisma.PrismaPromise<GetCustomersRiskProfileModelAggregateType<T>>

    /**
     * Group by CustomersRiskProfileModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomersRiskProfileModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomersRiskProfileModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomersRiskProfileModelGroupByArgs['orderBy'] }
        : { orderBy?: CustomersRiskProfileModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomersRiskProfileModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomersRiskProfileModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustomersRiskProfileModel model
   */
  readonly fields: CustomersRiskProfileModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustomersRiskProfileModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomersRiskProfileModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustomersRiskProfileModel model
   */
  interface CustomersRiskProfileModelFieldRefs {
    readonly id: FieldRef<"CustomersRiskProfileModel", 'Int'>
    readonly createdAt: FieldRef<"CustomersRiskProfileModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CustomersRiskProfileModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustomersRiskProfileModel findUnique
   */
  export type CustomersRiskProfileModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter, which CustomersRiskProfileModel to fetch.
     */
    where: CustomersRiskProfileModelWhereUniqueInput
  }

  /**
   * CustomersRiskProfileModel findUniqueOrThrow
   */
  export type CustomersRiskProfileModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter, which CustomersRiskProfileModel to fetch.
     */
    where: CustomersRiskProfileModelWhereUniqueInput
  }

  /**
   * CustomersRiskProfileModel findFirst
   */
  export type CustomersRiskProfileModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter, which CustomersRiskProfileModel to fetch.
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersRiskProfileModels to fetch.
     */
    orderBy?: CustomersRiskProfileModelOrderByWithRelationInput | CustomersRiskProfileModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersRiskProfileModels.
     */
    cursor?: CustomersRiskProfileModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersRiskProfileModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersRiskProfileModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersRiskProfileModels.
     */
    distinct?: CustomersRiskProfileModelScalarFieldEnum | CustomersRiskProfileModelScalarFieldEnum[]
  }

  /**
   * CustomersRiskProfileModel findFirstOrThrow
   */
  export type CustomersRiskProfileModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter, which CustomersRiskProfileModel to fetch.
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersRiskProfileModels to fetch.
     */
    orderBy?: CustomersRiskProfileModelOrderByWithRelationInput | CustomersRiskProfileModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustomersRiskProfileModels.
     */
    cursor?: CustomersRiskProfileModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersRiskProfileModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersRiskProfileModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustomersRiskProfileModels.
     */
    distinct?: CustomersRiskProfileModelScalarFieldEnum | CustomersRiskProfileModelScalarFieldEnum[]
  }

  /**
   * CustomersRiskProfileModel findMany
   */
  export type CustomersRiskProfileModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter, which CustomersRiskProfileModels to fetch.
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustomersRiskProfileModels to fetch.
     */
    orderBy?: CustomersRiskProfileModelOrderByWithRelationInput | CustomersRiskProfileModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustomersRiskProfileModels.
     */
    cursor?: CustomersRiskProfileModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustomersRiskProfileModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustomersRiskProfileModels.
     */
    skip?: number
    distinct?: CustomersRiskProfileModelScalarFieldEnum | CustomersRiskProfileModelScalarFieldEnum[]
  }

  /**
   * CustomersRiskProfileModel create
   */
  export type CustomersRiskProfileModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * The data needed to create a CustomersRiskProfileModel.
     */
    data: XOR<CustomersRiskProfileModelCreateInput, CustomersRiskProfileModelUncheckedCreateInput>
  }

  /**
   * CustomersRiskProfileModel createMany
   */
  export type CustomersRiskProfileModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustomersRiskProfileModels.
     */
    data: CustomersRiskProfileModelCreateManyInput | CustomersRiskProfileModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersRiskProfileModel createManyAndReturn
   */
  export type CustomersRiskProfileModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * The data used to create many CustomersRiskProfileModels.
     */
    data: CustomersRiskProfileModelCreateManyInput | CustomersRiskProfileModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustomersRiskProfileModel update
   */
  export type CustomersRiskProfileModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * The data needed to update a CustomersRiskProfileModel.
     */
    data: XOR<CustomersRiskProfileModelUpdateInput, CustomersRiskProfileModelUncheckedUpdateInput>
    /**
     * Choose, which CustomersRiskProfileModel to update.
     */
    where: CustomersRiskProfileModelWhereUniqueInput
  }

  /**
   * CustomersRiskProfileModel updateMany
   */
  export type CustomersRiskProfileModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustomersRiskProfileModels.
     */
    data: XOR<CustomersRiskProfileModelUpdateManyMutationInput, CustomersRiskProfileModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersRiskProfileModels to update
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * Limit how many CustomersRiskProfileModels to update.
     */
    limit?: number
  }

  /**
   * CustomersRiskProfileModel updateManyAndReturn
   */
  export type CustomersRiskProfileModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * The data used to update CustomersRiskProfileModels.
     */
    data: XOR<CustomersRiskProfileModelUpdateManyMutationInput, CustomersRiskProfileModelUncheckedUpdateManyInput>
    /**
     * Filter which CustomersRiskProfileModels to update
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * Limit how many CustomersRiskProfileModels to update.
     */
    limit?: number
  }

  /**
   * CustomersRiskProfileModel upsert
   */
  export type CustomersRiskProfileModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * The filter to search for the CustomersRiskProfileModel to update in case it exists.
     */
    where: CustomersRiskProfileModelWhereUniqueInput
    /**
     * In case the CustomersRiskProfileModel found by the `where` argument doesn't exist, create a new CustomersRiskProfileModel with this data.
     */
    create: XOR<CustomersRiskProfileModelCreateInput, CustomersRiskProfileModelUncheckedCreateInput>
    /**
     * In case the CustomersRiskProfileModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomersRiskProfileModelUpdateInput, CustomersRiskProfileModelUncheckedUpdateInput>
  }

  /**
   * CustomersRiskProfileModel delete
   */
  export type CustomersRiskProfileModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
    /**
     * Filter which CustomersRiskProfileModel to delete.
     */
    where: CustomersRiskProfileModelWhereUniqueInput
  }

  /**
   * CustomersRiskProfileModel deleteMany
   */
  export type CustomersRiskProfileModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustomersRiskProfileModels to delete
     */
    where?: CustomersRiskProfileModelWhereInput
    /**
     * Limit how many CustomersRiskProfileModels to delete.
     */
    limit?: number
  }

  /**
   * CustomersRiskProfileModel without action
   */
  export type CustomersRiskProfileModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomersRiskProfileModel
     */
    select?: CustomersRiskProfileModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomersRiskProfileModel
     */
    omit?: CustomersRiskProfileModelOmit<ExtArgs> | null
  }


  /**
   * Model AddressModel
   */

  export type AggregateAddressModel = {
    _count: AddressModelCountAggregateOutputType | null
    _avg: AddressModelAvgAggregateOutputType | null
    _sum: AddressModelSumAggregateOutputType | null
    _min: AddressModelMinAggregateOutputType | null
    _max: AddressModelMaxAggregateOutputType | null
  }

  export type AddressModelAvgAggregateOutputType = {
    id: number | null
  }

  export type AddressModelSumAggregateOutputType = {
    id: number | null
  }

  export type AddressModelMinAggregateOutputType = {
    id: number | null
    line1: string | null
    line2: string | null
    line3: string | null
    postOffice: string | null
    cityOrDistrict: string | null
    state: string | null
    pinCode: string | null
    country: string | null
    fullAddress: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AddressModelMaxAggregateOutputType = {
    id: number | null
    line1: string | null
    line2: string | null
    line3: string | null
    postOffice: string | null
    cityOrDistrict: string | null
    state: string | null
    pinCode: string | null
    country: string | null
    fullAddress: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AddressModelCountAggregateOutputType = {
    id: number
    line1: number
    line2: number
    line3: number
    postOffice: number
    cityOrDistrict: number
    state: number
    pinCode: number
    country: number
    fullAddress: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AddressModelAvgAggregateInputType = {
    id?: true
  }

  export type AddressModelSumAggregateInputType = {
    id?: true
  }

  export type AddressModelMinAggregateInputType = {
    id?: true
    line1?: true
    line2?: true
    line3?: true
    postOffice?: true
    cityOrDistrict?: true
    state?: true
    pinCode?: true
    country?: true
    fullAddress?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AddressModelMaxAggregateInputType = {
    id?: true
    line1?: true
    line2?: true
    line3?: true
    postOffice?: true
    cityOrDistrict?: true
    state?: true
    pinCode?: true
    country?: true
    fullAddress?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AddressModelCountAggregateInputType = {
    id?: true
    line1?: true
    line2?: true
    line3?: true
    postOffice?: true
    cityOrDistrict?: true
    state?: true
    pinCode?: true
    country?: true
    fullAddress?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AddressModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AddressModel to aggregate.
     */
    where?: AddressModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AddressModels to fetch.
     */
    orderBy?: AddressModelOrderByWithRelationInput | AddressModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AddressModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AddressModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AddressModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AddressModels
    **/
    _count?: true | AddressModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AddressModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AddressModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AddressModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AddressModelMaxAggregateInputType
  }

  export type GetAddressModelAggregateType<T extends AddressModelAggregateArgs> = {
        [P in keyof T & keyof AggregateAddressModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAddressModel[P]>
      : GetScalarType<T[P], AggregateAddressModel[P]>
  }




  export type AddressModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AddressModelWhereInput
    orderBy?: AddressModelOrderByWithAggregationInput | AddressModelOrderByWithAggregationInput[]
    by: AddressModelScalarFieldEnum[] | AddressModelScalarFieldEnum
    having?: AddressModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AddressModelCountAggregateInputType | true
    _avg?: AddressModelAvgAggregateInputType
    _sum?: AddressModelSumAggregateInputType
    _min?: AddressModelMinAggregateInputType
    _max?: AddressModelMaxAggregateInputType
  }

  export type AddressModelGroupByOutputType = {
    id: number
    line1: string
    line2: string | null
    line3: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt: Date
    updatedAt: Date
    _count: AddressModelCountAggregateOutputType | null
    _avg: AddressModelAvgAggregateOutputType | null
    _sum: AddressModelSumAggregateOutputType | null
    _min: AddressModelMinAggregateOutputType | null
    _max: AddressModelMaxAggregateOutputType | null
  }

  type GetAddressModelGroupByPayload<T extends AddressModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AddressModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AddressModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AddressModelGroupByOutputType[P]>
            : GetScalarType<T[P], AddressModelGroupByOutputType[P]>
        }
      >
    >


  export type AddressModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    line1?: boolean
    line2?: boolean
    line3?: boolean
    postOffice?: boolean
    cityOrDistrict?: boolean
    state?: boolean
    pinCode?: boolean
    country?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    currentAddressOf?: boolean | AddressModel$currentAddressOfArgs<ExtArgs>
    permanentAddressOf?: boolean | AddressModel$permanentAddressOfArgs<ExtArgs>
    _count?: boolean | AddressModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["addressModel"]>

  export type AddressModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    line1?: boolean
    line2?: boolean
    line3?: boolean
    postOffice?: boolean
    cityOrDistrict?: boolean
    state?: boolean
    pinCode?: boolean
    country?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["addressModel"]>

  export type AddressModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    line1?: boolean
    line2?: boolean
    line3?: boolean
    postOffice?: boolean
    cityOrDistrict?: boolean
    state?: boolean
    pinCode?: boolean
    country?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["addressModel"]>

  export type AddressModelSelectScalar = {
    id?: boolean
    line1?: boolean
    line2?: boolean
    line3?: boolean
    postOffice?: boolean
    cityOrDistrict?: boolean
    state?: boolean
    pinCode?: boolean
    country?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AddressModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "line1" | "line2" | "line3" | "postOffice" | "cityOrDistrict" | "state" | "pinCode" | "country" | "fullAddress" | "createdAt" | "updatedAt", ExtArgs["result"]["addressModel"]>
  export type AddressModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    currentAddressOf?: boolean | AddressModel$currentAddressOfArgs<ExtArgs>
    permanentAddressOf?: boolean | AddressModel$permanentAddressOfArgs<ExtArgs>
    _count?: boolean | AddressModelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AddressModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AddressModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AddressModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AddressModel"
    objects: {
      /**
       * Reverse relations (used by personal info)
       */
      currentAddressOf: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
      permanentAddressOf: Prisma.$CustomerProfileDataModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      /**
       * Address lines
       */
      line1: string
      line2: string | null
      line3: string | null
      /**
       * Location details
       */
      postOffice: string
      cityOrDistrict: string
      state: string
      pinCode: string
      country: string
      /**
       * Full address text
       */
      fullAddress: string
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["addressModel"]>
    composites: {}
  }

  type AddressModelGetPayload<S extends boolean | null | undefined | AddressModelDefaultArgs> = $Result.GetResult<Prisma.$AddressModelPayload, S>

  type AddressModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AddressModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AddressModelCountAggregateInputType | true
    }

  export interface AddressModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AddressModel'], meta: { name: 'AddressModel' } }
    /**
     * Find zero or one AddressModel that matches the filter.
     * @param {AddressModelFindUniqueArgs} args - Arguments to find a AddressModel
     * @example
     * // Get one AddressModel
     * const addressModel = await prisma.addressModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AddressModelFindUniqueArgs>(args: SelectSubset<T, AddressModelFindUniqueArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AddressModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AddressModelFindUniqueOrThrowArgs} args - Arguments to find a AddressModel
     * @example
     * // Get one AddressModel
     * const addressModel = await prisma.addressModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AddressModelFindUniqueOrThrowArgs>(args: SelectSubset<T, AddressModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AddressModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelFindFirstArgs} args - Arguments to find a AddressModel
     * @example
     * // Get one AddressModel
     * const addressModel = await prisma.addressModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AddressModelFindFirstArgs>(args?: SelectSubset<T, AddressModelFindFirstArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AddressModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelFindFirstOrThrowArgs} args - Arguments to find a AddressModel
     * @example
     * // Get one AddressModel
     * const addressModel = await prisma.addressModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AddressModelFindFirstOrThrowArgs>(args?: SelectSubset<T, AddressModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AddressModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AddressModels
     * const addressModels = await prisma.addressModel.findMany()
     * 
     * // Get first 10 AddressModels
     * const addressModels = await prisma.addressModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const addressModelWithIdOnly = await prisma.addressModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AddressModelFindManyArgs>(args?: SelectSubset<T, AddressModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AddressModel.
     * @param {AddressModelCreateArgs} args - Arguments to create a AddressModel.
     * @example
     * // Create one AddressModel
     * const AddressModel = await prisma.addressModel.create({
     *   data: {
     *     // ... data to create a AddressModel
     *   }
     * })
     * 
     */
    create<T extends AddressModelCreateArgs>(args: SelectSubset<T, AddressModelCreateArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AddressModels.
     * @param {AddressModelCreateManyArgs} args - Arguments to create many AddressModels.
     * @example
     * // Create many AddressModels
     * const addressModel = await prisma.addressModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AddressModelCreateManyArgs>(args?: SelectSubset<T, AddressModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AddressModels and returns the data saved in the database.
     * @param {AddressModelCreateManyAndReturnArgs} args - Arguments to create many AddressModels.
     * @example
     * // Create many AddressModels
     * const addressModel = await prisma.addressModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AddressModels and only return the `id`
     * const addressModelWithIdOnly = await prisma.addressModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AddressModelCreateManyAndReturnArgs>(args?: SelectSubset<T, AddressModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AddressModel.
     * @param {AddressModelDeleteArgs} args - Arguments to delete one AddressModel.
     * @example
     * // Delete one AddressModel
     * const AddressModel = await prisma.addressModel.delete({
     *   where: {
     *     // ... filter to delete one AddressModel
     *   }
     * })
     * 
     */
    delete<T extends AddressModelDeleteArgs>(args: SelectSubset<T, AddressModelDeleteArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AddressModel.
     * @param {AddressModelUpdateArgs} args - Arguments to update one AddressModel.
     * @example
     * // Update one AddressModel
     * const addressModel = await prisma.addressModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AddressModelUpdateArgs>(args: SelectSubset<T, AddressModelUpdateArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AddressModels.
     * @param {AddressModelDeleteManyArgs} args - Arguments to filter AddressModels to delete.
     * @example
     * // Delete a few AddressModels
     * const { count } = await prisma.addressModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AddressModelDeleteManyArgs>(args?: SelectSubset<T, AddressModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AddressModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AddressModels
     * const addressModel = await prisma.addressModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AddressModelUpdateManyArgs>(args: SelectSubset<T, AddressModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AddressModels and returns the data updated in the database.
     * @param {AddressModelUpdateManyAndReturnArgs} args - Arguments to update many AddressModels.
     * @example
     * // Update many AddressModels
     * const addressModel = await prisma.addressModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AddressModels and only return the `id`
     * const addressModelWithIdOnly = await prisma.addressModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AddressModelUpdateManyAndReturnArgs>(args: SelectSubset<T, AddressModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AddressModel.
     * @param {AddressModelUpsertArgs} args - Arguments to update or create a AddressModel.
     * @example
     * // Update or create a AddressModel
     * const addressModel = await prisma.addressModel.upsert({
     *   create: {
     *     // ... data to create a AddressModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AddressModel we want to update
     *   }
     * })
     */
    upsert<T extends AddressModelUpsertArgs>(args: SelectSubset<T, AddressModelUpsertArgs<ExtArgs>>): Prisma__AddressModelClient<$Result.GetResult<Prisma.$AddressModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AddressModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelCountArgs} args - Arguments to filter AddressModels to count.
     * @example
     * // Count the number of AddressModels
     * const count = await prisma.addressModel.count({
     *   where: {
     *     // ... the filter for the AddressModels we want to count
     *   }
     * })
    **/
    count<T extends AddressModelCountArgs>(
      args?: Subset<T, AddressModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AddressModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AddressModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AddressModelAggregateArgs>(args: Subset<T, AddressModelAggregateArgs>): Prisma.PrismaPromise<GetAddressModelAggregateType<T>>

    /**
     * Group by AddressModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AddressModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AddressModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AddressModelGroupByArgs['orderBy'] }
        : { orderBy?: AddressModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AddressModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAddressModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AddressModel model
   */
  readonly fields: AddressModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AddressModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AddressModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    currentAddressOf<T extends AddressModel$currentAddressOfArgs<ExtArgs> = {}>(args?: Subset<T, AddressModel$currentAddressOfArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    permanentAddressOf<T extends AddressModel$permanentAddressOfArgs<ExtArgs> = {}>(args?: Subset<T, AddressModel$permanentAddressOfArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerProfileDataModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AddressModel model
   */
  interface AddressModelFieldRefs {
    readonly id: FieldRef<"AddressModel", 'Int'>
    readonly line1: FieldRef<"AddressModel", 'String'>
    readonly line2: FieldRef<"AddressModel", 'String'>
    readonly line3: FieldRef<"AddressModel", 'String'>
    readonly postOffice: FieldRef<"AddressModel", 'String'>
    readonly cityOrDistrict: FieldRef<"AddressModel", 'String'>
    readonly state: FieldRef<"AddressModel", 'String'>
    readonly pinCode: FieldRef<"AddressModel", 'String'>
    readonly country: FieldRef<"AddressModel", 'String'>
    readonly fullAddress: FieldRef<"AddressModel", 'String'>
    readonly createdAt: FieldRef<"AddressModel", 'DateTime'>
    readonly updatedAt: FieldRef<"AddressModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AddressModel findUnique
   */
  export type AddressModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter, which AddressModel to fetch.
     */
    where: AddressModelWhereUniqueInput
  }

  /**
   * AddressModel findUniqueOrThrow
   */
  export type AddressModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter, which AddressModel to fetch.
     */
    where: AddressModelWhereUniqueInput
  }

  /**
   * AddressModel findFirst
   */
  export type AddressModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter, which AddressModel to fetch.
     */
    where?: AddressModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AddressModels to fetch.
     */
    orderBy?: AddressModelOrderByWithRelationInput | AddressModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AddressModels.
     */
    cursor?: AddressModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AddressModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AddressModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AddressModels.
     */
    distinct?: AddressModelScalarFieldEnum | AddressModelScalarFieldEnum[]
  }

  /**
   * AddressModel findFirstOrThrow
   */
  export type AddressModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter, which AddressModel to fetch.
     */
    where?: AddressModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AddressModels to fetch.
     */
    orderBy?: AddressModelOrderByWithRelationInput | AddressModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AddressModels.
     */
    cursor?: AddressModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AddressModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AddressModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AddressModels.
     */
    distinct?: AddressModelScalarFieldEnum | AddressModelScalarFieldEnum[]
  }

  /**
   * AddressModel findMany
   */
  export type AddressModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter, which AddressModels to fetch.
     */
    where?: AddressModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AddressModels to fetch.
     */
    orderBy?: AddressModelOrderByWithRelationInput | AddressModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AddressModels.
     */
    cursor?: AddressModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AddressModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AddressModels.
     */
    skip?: number
    distinct?: AddressModelScalarFieldEnum | AddressModelScalarFieldEnum[]
  }

  /**
   * AddressModel create
   */
  export type AddressModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * The data needed to create a AddressModel.
     */
    data: XOR<AddressModelCreateInput, AddressModelUncheckedCreateInput>
  }

  /**
   * AddressModel createMany
   */
  export type AddressModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AddressModels.
     */
    data: AddressModelCreateManyInput | AddressModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AddressModel createManyAndReturn
   */
  export type AddressModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * The data used to create many AddressModels.
     */
    data: AddressModelCreateManyInput | AddressModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AddressModel update
   */
  export type AddressModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * The data needed to update a AddressModel.
     */
    data: XOR<AddressModelUpdateInput, AddressModelUncheckedUpdateInput>
    /**
     * Choose, which AddressModel to update.
     */
    where: AddressModelWhereUniqueInput
  }

  /**
   * AddressModel updateMany
   */
  export type AddressModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AddressModels.
     */
    data: XOR<AddressModelUpdateManyMutationInput, AddressModelUncheckedUpdateManyInput>
    /**
     * Filter which AddressModels to update
     */
    where?: AddressModelWhereInput
    /**
     * Limit how many AddressModels to update.
     */
    limit?: number
  }

  /**
   * AddressModel updateManyAndReturn
   */
  export type AddressModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * The data used to update AddressModels.
     */
    data: XOR<AddressModelUpdateManyMutationInput, AddressModelUncheckedUpdateManyInput>
    /**
     * Filter which AddressModels to update
     */
    where?: AddressModelWhereInput
    /**
     * Limit how many AddressModels to update.
     */
    limit?: number
  }

  /**
   * AddressModel upsert
   */
  export type AddressModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * The filter to search for the AddressModel to update in case it exists.
     */
    where: AddressModelWhereUniqueInput
    /**
     * In case the AddressModel found by the `where` argument doesn't exist, create a new AddressModel with this data.
     */
    create: XOR<AddressModelCreateInput, AddressModelUncheckedCreateInput>
    /**
     * In case the AddressModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AddressModelUpdateInput, AddressModelUncheckedUpdateInput>
  }

  /**
   * AddressModel delete
   */
  export type AddressModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
    /**
     * Filter which AddressModel to delete.
     */
    where: AddressModelWhereUniqueInput
  }

  /**
   * AddressModel deleteMany
   */
  export type AddressModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AddressModels to delete
     */
    where?: AddressModelWhereInput
    /**
     * Limit how many AddressModels to delete.
     */
    limit?: number
  }

  /**
   * AddressModel.currentAddressOf
   */
  export type AddressModel$currentAddressOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * AddressModel.permanentAddressOf
   */
  export type AddressModel$permanentAddressOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerProfileDataModel
     */
    select?: CustomerProfileDataModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustomerProfileDataModel
     */
    omit?: CustomerProfileDataModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerProfileDataModelInclude<ExtArgs> | null
    where?: CustomerProfileDataModelWhereInput
    orderBy?: CustomerProfileDataModelOrderByWithRelationInput | CustomerProfileDataModelOrderByWithRelationInput[]
    cursor?: CustomerProfileDataModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CustomerProfileDataModelScalarFieldEnum | CustomerProfileDataModelScalarFieldEnum[]
  }

  /**
   * AddressModel without action
   */
  export type AddressModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AddressModel
     */
    select?: AddressModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AddressModel
     */
    omit?: AddressModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AddressModelInclude<ExtArgs> | null
  }


  /**
   * Model LeadsModel
   */

  export type AggregateLeadsModel = {
    _count: LeadsModelCountAggregateOutputType | null
    _avg: LeadsModelAvgAggregateOutputType | null
    _sum: LeadsModelSumAggregateOutputType | null
    _min: LeadsModelMinAggregateOutputType | null
    _max: LeadsModelMaxAggregateOutputType | null
  }

  export type LeadsModelAvgAggregateOutputType = {
    id: number | null
    exInvestmentAmount: number | null
    createdBy: number | null
  }

  export type LeadsModelSumAggregateOutputType = {
    id: number | null
    exInvestmentAmount: number | null
    createdBy: number | null
  }

  export type LeadsModelMinAggregateOutputType = {
    id: number | null
    fullName: string | null
    emailAddress: string | null
    phoneNo: string | null
    companyName: string | null
    leadSource: $Enums.LeadSource | null
    bondType: $Enums.BondType | null
    status: $Enums.LeadStatus | null
    exInvestmentAmount: number | null
    note: string | null
    createdBy: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LeadsModelMaxAggregateOutputType = {
    id: number | null
    fullName: string | null
    emailAddress: string | null
    phoneNo: string | null
    companyName: string | null
    leadSource: $Enums.LeadSource | null
    bondType: $Enums.BondType | null
    status: $Enums.LeadStatus | null
    exInvestmentAmount: number | null
    note: string | null
    createdBy: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LeadsModelCountAggregateOutputType = {
    id: number
    fullName: number
    emailAddress: number
    phoneNo: number
    companyName: number
    leadSource: number
    bondType: number
    status: number
    exInvestmentAmount: number
    note: number
    createdBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LeadsModelAvgAggregateInputType = {
    id?: true
    exInvestmentAmount?: true
    createdBy?: true
  }

  export type LeadsModelSumAggregateInputType = {
    id?: true
    exInvestmentAmount?: true
    createdBy?: true
  }

  export type LeadsModelMinAggregateInputType = {
    id?: true
    fullName?: true
    emailAddress?: true
    phoneNo?: true
    companyName?: true
    leadSource?: true
    bondType?: true
    status?: true
    exInvestmentAmount?: true
    note?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadsModelMaxAggregateInputType = {
    id?: true
    fullName?: true
    emailAddress?: true
    phoneNo?: true
    companyName?: true
    leadSource?: true
    bondType?: true
    status?: true
    exInvestmentAmount?: true
    note?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadsModelCountAggregateInputType = {
    id?: true
    fullName?: true
    emailAddress?: true
    phoneNo?: true
    companyName?: true
    leadSource?: true
    bondType?: true
    status?: true
    exInvestmentAmount?: true
    note?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LeadsModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeadsModel to aggregate.
     */
    where?: LeadsModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadsModels to fetch.
     */
    orderBy?: LeadsModelOrderByWithRelationInput | LeadsModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeadsModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadsModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadsModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LeadsModels
    **/
    _count?: true | LeadsModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeadsModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeadsModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeadsModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeadsModelMaxAggregateInputType
  }

  export type GetLeadsModelAggregateType<T extends LeadsModelAggregateArgs> = {
        [P in keyof T & keyof AggregateLeadsModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeadsModel[P]>
      : GetScalarType<T[P], AggregateLeadsModel[P]>
  }




  export type LeadsModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeadsModelWhereInput
    orderBy?: LeadsModelOrderByWithAggregationInput | LeadsModelOrderByWithAggregationInput[]
    by: LeadsModelScalarFieldEnum[] | LeadsModelScalarFieldEnum
    having?: LeadsModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeadsModelCountAggregateInputType | true
    _avg?: LeadsModelAvgAggregateInputType
    _sum?: LeadsModelSumAggregateInputType
    _min?: LeadsModelMinAggregateInputType
    _max?: LeadsModelMaxAggregateInputType
  }

  export type LeadsModelGroupByOutputType = {
    id: number
    fullName: string
    emailAddress: string
    phoneNo: string
    companyName: string
    leadSource: $Enums.LeadSource
    bondType: $Enums.BondType
    status: $Enums.LeadStatus
    exInvestmentAmount: number | null
    note: string | null
    createdBy: number
    createdAt: Date
    updatedAt: Date
    _count: LeadsModelCountAggregateOutputType | null
    _avg: LeadsModelAvgAggregateOutputType | null
    _sum: LeadsModelSumAggregateOutputType | null
    _min: LeadsModelMinAggregateOutputType | null
    _max: LeadsModelMaxAggregateOutputType | null
  }

  type GetLeadsModelGroupByPayload<T extends LeadsModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeadsModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeadsModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeadsModelGroupByOutputType[P]>
            : GetScalarType<T[P], LeadsModelGroupByOutputType[P]>
        }
      >
    >


  export type LeadsModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    companyName?: boolean
    leadSource?: boolean
    bondType?: boolean
    status?: boolean
    exInvestmentAmount?: boolean
    note?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadsModel"]>

  export type LeadsModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    companyName?: boolean
    leadSource?: boolean
    bondType?: boolean
    status?: boolean
    exInvestmentAmount?: boolean
    note?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadsModel"]>

  export type LeadsModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    companyName?: boolean
    leadSource?: boolean
    bondType?: boolean
    status?: boolean
    exInvestmentAmount?: boolean
    note?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadsModel"]>

  export type LeadsModelSelectScalar = {
    id?: boolean
    fullName?: boolean
    emailAddress?: boolean
    phoneNo?: boolean
    companyName?: boolean
    leadSource?: boolean
    bondType?: boolean
    status?: boolean
    exInvestmentAmount?: boolean
    note?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LeadsModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "emailAddress" | "phoneNo" | "companyName" | "leadSource" | "bondType" | "status" | "exInvestmentAmount" | "note" | "createdBy" | "createdAt" | "updatedAt", ExtArgs["result"]["leadsModel"]>

  export type $LeadsModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LeadsModel"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      fullName: string
      emailAddress: string
      phoneNo: string
      companyName: string
      leadSource: $Enums.LeadSource
      bondType: $Enums.BondType
      status: $Enums.LeadStatus
      exInvestmentAmount: number | null
      note: string | null
      createdBy: number
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["leadsModel"]>
    composites: {}
  }

  type LeadsModelGetPayload<S extends boolean | null | undefined | LeadsModelDefaultArgs> = $Result.GetResult<Prisma.$LeadsModelPayload, S>

  type LeadsModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeadsModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeadsModelCountAggregateInputType | true
    }

  export interface LeadsModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LeadsModel'], meta: { name: 'LeadsModel' } }
    /**
     * Find zero or one LeadsModel that matches the filter.
     * @param {LeadsModelFindUniqueArgs} args - Arguments to find a LeadsModel
     * @example
     * // Get one LeadsModel
     * const leadsModel = await prisma.leadsModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeadsModelFindUniqueArgs>(args: SelectSubset<T, LeadsModelFindUniqueArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LeadsModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeadsModelFindUniqueOrThrowArgs} args - Arguments to find a LeadsModel
     * @example
     * // Get one LeadsModel
     * const leadsModel = await prisma.leadsModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeadsModelFindUniqueOrThrowArgs>(args: SelectSubset<T, LeadsModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeadsModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelFindFirstArgs} args - Arguments to find a LeadsModel
     * @example
     * // Get one LeadsModel
     * const leadsModel = await prisma.leadsModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeadsModelFindFirstArgs>(args?: SelectSubset<T, LeadsModelFindFirstArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeadsModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelFindFirstOrThrowArgs} args - Arguments to find a LeadsModel
     * @example
     * // Get one LeadsModel
     * const leadsModel = await prisma.leadsModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeadsModelFindFirstOrThrowArgs>(args?: SelectSubset<T, LeadsModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LeadsModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LeadsModels
     * const leadsModels = await prisma.leadsModel.findMany()
     * 
     * // Get first 10 LeadsModels
     * const leadsModels = await prisma.leadsModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leadsModelWithIdOnly = await prisma.leadsModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeadsModelFindManyArgs>(args?: SelectSubset<T, LeadsModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LeadsModel.
     * @param {LeadsModelCreateArgs} args - Arguments to create a LeadsModel.
     * @example
     * // Create one LeadsModel
     * const LeadsModel = await prisma.leadsModel.create({
     *   data: {
     *     // ... data to create a LeadsModel
     *   }
     * })
     * 
     */
    create<T extends LeadsModelCreateArgs>(args: SelectSubset<T, LeadsModelCreateArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LeadsModels.
     * @param {LeadsModelCreateManyArgs} args - Arguments to create many LeadsModels.
     * @example
     * // Create many LeadsModels
     * const leadsModel = await prisma.leadsModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeadsModelCreateManyArgs>(args?: SelectSubset<T, LeadsModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LeadsModels and returns the data saved in the database.
     * @param {LeadsModelCreateManyAndReturnArgs} args - Arguments to create many LeadsModels.
     * @example
     * // Create many LeadsModels
     * const leadsModel = await prisma.leadsModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LeadsModels and only return the `id`
     * const leadsModelWithIdOnly = await prisma.leadsModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeadsModelCreateManyAndReturnArgs>(args?: SelectSubset<T, LeadsModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LeadsModel.
     * @param {LeadsModelDeleteArgs} args - Arguments to delete one LeadsModel.
     * @example
     * // Delete one LeadsModel
     * const LeadsModel = await prisma.leadsModel.delete({
     *   where: {
     *     // ... filter to delete one LeadsModel
     *   }
     * })
     * 
     */
    delete<T extends LeadsModelDeleteArgs>(args: SelectSubset<T, LeadsModelDeleteArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LeadsModel.
     * @param {LeadsModelUpdateArgs} args - Arguments to update one LeadsModel.
     * @example
     * // Update one LeadsModel
     * const leadsModel = await prisma.leadsModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeadsModelUpdateArgs>(args: SelectSubset<T, LeadsModelUpdateArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LeadsModels.
     * @param {LeadsModelDeleteManyArgs} args - Arguments to filter LeadsModels to delete.
     * @example
     * // Delete a few LeadsModels
     * const { count } = await prisma.leadsModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeadsModelDeleteManyArgs>(args?: SelectSubset<T, LeadsModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeadsModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LeadsModels
     * const leadsModel = await prisma.leadsModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeadsModelUpdateManyArgs>(args: SelectSubset<T, LeadsModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeadsModels and returns the data updated in the database.
     * @param {LeadsModelUpdateManyAndReturnArgs} args - Arguments to update many LeadsModels.
     * @example
     * // Update many LeadsModels
     * const leadsModel = await prisma.leadsModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LeadsModels and only return the `id`
     * const leadsModelWithIdOnly = await prisma.leadsModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LeadsModelUpdateManyAndReturnArgs>(args: SelectSubset<T, LeadsModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LeadsModel.
     * @param {LeadsModelUpsertArgs} args - Arguments to update or create a LeadsModel.
     * @example
     * // Update or create a LeadsModel
     * const leadsModel = await prisma.leadsModel.upsert({
     *   create: {
     *     // ... data to create a LeadsModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LeadsModel we want to update
     *   }
     * })
     */
    upsert<T extends LeadsModelUpsertArgs>(args: SelectSubset<T, LeadsModelUpsertArgs<ExtArgs>>): Prisma__LeadsModelClient<$Result.GetResult<Prisma.$LeadsModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LeadsModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelCountArgs} args - Arguments to filter LeadsModels to count.
     * @example
     * // Count the number of LeadsModels
     * const count = await prisma.leadsModel.count({
     *   where: {
     *     // ... the filter for the LeadsModels we want to count
     *   }
     * })
    **/
    count<T extends LeadsModelCountArgs>(
      args?: Subset<T, LeadsModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeadsModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LeadsModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeadsModelAggregateArgs>(args: Subset<T, LeadsModelAggregateArgs>): Prisma.PrismaPromise<GetLeadsModelAggregateType<T>>

    /**
     * Group by LeadsModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadsModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeadsModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeadsModelGroupByArgs['orderBy'] }
        : { orderBy?: LeadsModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeadsModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeadsModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LeadsModel model
   */
  readonly fields: LeadsModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LeadsModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeadsModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LeadsModel model
   */
  interface LeadsModelFieldRefs {
    readonly id: FieldRef<"LeadsModel", 'Int'>
    readonly fullName: FieldRef<"LeadsModel", 'String'>
    readonly emailAddress: FieldRef<"LeadsModel", 'String'>
    readonly phoneNo: FieldRef<"LeadsModel", 'String'>
    readonly companyName: FieldRef<"LeadsModel", 'String'>
    readonly leadSource: FieldRef<"LeadsModel", 'LeadSource'>
    readonly bondType: FieldRef<"LeadsModel", 'BondType'>
    readonly status: FieldRef<"LeadsModel", 'LeadStatus'>
    readonly exInvestmentAmount: FieldRef<"LeadsModel", 'Int'>
    readonly note: FieldRef<"LeadsModel", 'String'>
    readonly createdBy: FieldRef<"LeadsModel", 'Int'>
    readonly createdAt: FieldRef<"LeadsModel", 'DateTime'>
    readonly updatedAt: FieldRef<"LeadsModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LeadsModel findUnique
   */
  export type LeadsModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadsModel to fetch.
     */
    where: LeadsModelWhereUniqueInput
  }

  /**
   * LeadsModel findUniqueOrThrow
   */
  export type LeadsModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadsModel to fetch.
     */
    where: LeadsModelWhereUniqueInput
  }

  /**
   * LeadsModel findFirst
   */
  export type LeadsModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadsModel to fetch.
     */
    where?: LeadsModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadsModels to fetch.
     */
    orderBy?: LeadsModelOrderByWithRelationInput | LeadsModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeadsModels.
     */
    cursor?: LeadsModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadsModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadsModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeadsModels.
     */
    distinct?: LeadsModelScalarFieldEnum | LeadsModelScalarFieldEnum[]
  }

  /**
   * LeadsModel findFirstOrThrow
   */
  export type LeadsModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadsModel to fetch.
     */
    where?: LeadsModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadsModels to fetch.
     */
    orderBy?: LeadsModelOrderByWithRelationInput | LeadsModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeadsModels.
     */
    cursor?: LeadsModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadsModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadsModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeadsModels.
     */
    distinct?: LeadsModelScalarFieldEnum | LeadsModelScalarFieldEnum[]
  }

  /**
   * LeadsModel findMany
   */
  export type LeadsModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadsModels to fetch.
     */
    where?: LeadsModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadsModels to fetch.
     */
    orderBy?: LeadsModelOrderByWithRelationInput | LeadsModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LeadsModels.
     */
    cursor?: LeadsModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadsModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadsModels.
     */
    skip?: number
    distinct?: LeadsModelScalarFieldEnum | LeadsModelScalarFieldEnum[]
  }

  /**
   * LeadsModel create
   */
  export type LeadsModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * The data needed to create a LeadsModel.
     */
    data: XOR<LeadsModelCreateInput, LeadsModelUncheckedCreateInput>
  }

  /**
   * LeadsModel createMany
   */
  export type LeadsModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LeadsModels.
     */
    data: LeadsModelCreateManyInput | LeadsModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeadsModel createManyAndReturn
   */
  export type LeadsModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * The data used to create many LeadsModels.
     */
    data: LeadsModelCreateManyInput | LeadsModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeadsModel update
   */
  export type LeadsModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * The data needed to update a LeadsModel.
     */
    data: XOR<LeadsModelUpdateInput, LeadsModelUncheckedUpdateInput>
    /**
     * Choose, which LeadsModel to update.
     */
    where: LeadsModelWhereUniqueInput
  }

  /**
   * LeadsModel updateMany
   */
  export type LeadsModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LeadsModels.
     */
    data: XOR<LeadsModelUpdateManyMutationInput, LeadsModelUncheckedUpdateManyInput>
    /**
     * Filter which LeadsModels to update
     */
    where?: LeadsModelWhereInput
    /**
     * Limit how many LeadsModels to update.
     */
    limit?: number
  }

  /**
   * LeadsModel updateManyAndReturn
   */
  export type LeadsModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * The data used to update LeadsModels.
     */
    data: XOR<LeadsModelUpdateManyMutationInput, LeadsModelUncheckedUpdateManyInput>
    /**
     * Filter which LeadsModels to update
     */
    where?: LeadsModelWhereInput
    /**
     * Limit how many LeadsModels to update.
     */
    limit?: number
  }

  /**
   * LeadsModel upsert
   */
  export type LeadsModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * The filter to search for the LeadsModel to update in case it exists.
     */
    where: LeadsModelWhereUniqueInput
    /**
     * In case the LeadsModel found by the `where` argument doesn't exist, create a new LeadsModel with this data.
     */
    create: XOR<LeadsModelCreateInput, LeadsModelUncheckedCreateInput>
    /**
     * In case the LeadsModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeadsModelUpdateInput, LeadsModelUncheckedUpdateInput>
  }

  /**
   * LeadsModel delete
   */
  export type LeadsModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
    /**
     * Filter which LeadsModel to delete.
     */
    where: LeadsModelWhereUniqueInput
  }

  /**
   * LeadsModel deleteMany
   */
  export type LeadsModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeadsModels to delete
     */
    where?: LeadsModelWhereInput
    /**
     * Limit how many LeadsModels to delete.
     */
    limit?: number
  }

  /**
   * LeadsModel without action
   */
  export type LeadsModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadsModel
     */
    select?: LeadsModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadsModel
     */
    omit?: LeadsModelOmit<ExtArgs> | null
  }


  /**
   * Model LeadFollowUpNotesModel
   */

  export type AggregateLeadFollowUpNotesModel = {
    _count: LeadFollowUpNotesModelCountAggregateOutputType | null
    _avg: LeadFollowUpNotesModelAvgAggregateOutputType | null
    _sum: LeadFollowUpNotesModelSumAggregateOutputType | null
    _min: LeadFollowUpNotesModelMinAggregateOutputType | null
    _max: LeadFollowUpNotesModelMaxAggregateOutputType | null
  }

  export type LeadFollowUpNotesModelAvgAggregateOutputType = {
    id: number | null
    leadId: number | null
    createdByID: number | null
  }

  export type LeadFollowUpNotesModelSumAggregateOutputType = {
    id: number | null
    leadId: number | null
    createdByID: number | null
  }

  export type LeadFollowUpNotesModelMinAggregateOutputType = {
    id: number | null
    leadId: number | null
    createdByName: string | null
    createdByID: number | null
    text: string | null
    nextDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LeadFollowUpNotesModelMaxAggregateOutputType = {
    id: number | null
    leadId: number | null
    createdByName: string | null
    createdByID: number | null
    text: string | null
    nextDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LeadFollowUpNotesModelCountAggregateOutputType = {
    id: number
    leadId: number
    createdByName: number
    createdByID: number
    text: number
    nextDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LeadFollowUpNotesModelAvgAggregateInputType = {
    id?: true
    leadId?: true
    createdByID?: true
  }

  export type LeadFollowUpNotesModelSumAggregateInputType = {
    id?: true
    leadId?: true
    createdByID?: true
  }

  export type LeadFollowUpNotesModelMinAggregateInputType = {
    id?: true
    leadId?: true
    createdByName?: true
    createdByID?: true
    text?: true
    nextDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadFollowUpNotesModelMaxAggregateInputType = {
    id?: true
    leadId?: true
    createdByName?: true
    createdByID?: true
    text?: true
    nextDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LeadFollowUpNotesModelCountAggregateInputType = {
    id?: true
    leadId?: true
    createdByName?: true
    createdByID?: true
    text?: true
    nextDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LeadFollowUpNotesModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeadFollowUpNotesModel to aggregate.
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadFollowUpNotesModels to fetch.
     */
    orderBy?: LeadFollowUpNotesModelOrderByWithRelationInput | LeadFollowUpNotesModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeadFollowUpNotesModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadFollowUpNotesModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadFollowUpNotesModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LeadFollowUpNotesModels
    **/
    _count?: true | LeadFollowUpNotesModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeadFollowUpNotesModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeadFollowUpNotesModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeadFollowUpNotesModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeadFollowUpNotesModelMaxAggregateInputType
  }

  export type GetLeadFollowUpNotesModelAggregateType<T extends LeadFollowUpNotesModelAggregateArgs> = {
        [P in keyof T & keyof AggregateLeadFollowUpNotesModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeadFollowUpNotesModel[P]>
      : GetScalarType<T[P], AggregateLeadFollowUpNotesModel[P]>
  }




  export type LeadFollowUpNotesModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeadFollowUpNotesModelWhereInput
    orderBy?: LeadFollowUpNotesModelOrderByWithAggregationInput | LeadFollowUpNotesModelOrderByWithAggregationInput[]
    by: LeadFollowUpNotesModelScalarFieldEnum[] | LeadFollowUpNotesModelScalarFieldEnum
    having?: LeadFollowUpNotesModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeadFollowUpNotesModelCountAggregateInputType | true
    _avg?: LeadFollowUpNotesModelAvgAggregateInputType
    _sum?: LeadFollowUpNotesModelSumAggregateInputType
    _min?: LeadFollowUpNotesModelMinAggregateInputType
    _max?: LeadFollowUpNotesModelMaxAggregateInputType
  }

  export type LeadFollowUpNotesModelGroupByOutputType = {
    id: number
    leadId: number
    createdByName: string
    createdByID: number
    text: string
    nextDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: LeadFollowUpNotesModelCountAggregateOutputType | null
    _avg: LeadFollowUpNotesModelAvgAggregateOutputType | null
    _sum: LeadFollowUpNotesModelSumAggregateOutputType | null
    _min: LeadFollowUpNotesModelMinAggregateOutputType | null
    _max: LeadFollowUpNotesModelMaxAggregateOutputType | null
  }

  type GetLeadFollowUpNotesModelGroupByPayload<T extends LeadFollowUpNotesModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeadFollowUpNotesModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeadFollowUpNotesModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeadFollowUpNotesModelGroupByOutputType[P]>
            : GetScalarType<T[P], LeadFollowUpNotesModelGroupByOutputType[P]>
        }
      >
    >


  export type LeadFollowUpNotesModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    createdByName?: boolean
    createdByID?: boolean
    text?: boolean
    nextDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadFollowUpNotesModel"]>

  export type LeadFollowUpNotesModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    createdByName?: boolean
    createdByID?: boolean
    text?: boolean
    nextDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadFollowUpNotesModel"]>

  export type LeadFollowUpNotesModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    createdByName?: boolean
    createdByID?: boolean
    text?: boolean
    nextDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["leadFollowUpNotesModel"]>

  export type LeadFollowUpNotesModelSelectScalar = {
    id?: boolean
    leadId?: boolean
    createdByName?: boolean
    createdByID?: boolean
    text?: boolean
    nextDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LeadFollowUpNotesModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "leadId" | "createdByName" | "createdByID" | "text" | "nextDate" | "createdAt" | "updatedAt", ExtArgs["result"]["leadFollowUpNotesModel"]>

  export type $LeadFollowUpNotesModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LeadFollowUpNotesModel"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      leadId: number
      createdByName: string
      createdByID: number
      text: string
      nextDate: Date | null
      /**
       * Timestamps
       */
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["leadFollowUpNotesModel"]>
    composites: {}
  }

  type LeadFollowUpNotesModelGetPayload<S extends boolean | null | undefined | LeadFollowUpNotesModelDefaultArgs> = $Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload, S>

  type LeadFollowUpNotesModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeadFollowUpNotesModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeadFollowUpNotesModelCountAggregateInputType | true
    }

  export interface LeadFollowUpNotesModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LeadFollowUpNotesModel'], meta: { name: 'LeadFollowUpNotesModel' } }
    /**
     * Find zero or one LeadFollowUpNotesModel that matches the filter.
     * @param {LeadFollowUpNotesModelFindUniqueArgs} args - Arguments to find a LeadFollowUpNotesModel
     * @example
     * // Get one LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeadFollowUpNotesModelFindUniqueArgs>(args: SelectSubset<T, LeadFollowUpNotesModelFindUniqueArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LeadFollowUpNotesModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeadFollowUpNotesModelFindUniqueOrThrowArgs} args - Arguments to find a LeadFollowUpNotesModel
     * @example
     * // Get one LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeadFollowUpNotesModelFindUniqueOrThrowArgs>(args: SelectSubset<T, LeadFollowUpNotesModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeadFollowUpNotesModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelFindFirstArgs} args - Arguments to find a LeadFollowUpNotesModel
     * @example
     * // Get one LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeadFollowUpNotesModelFindFirstArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelFindFirstArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeadFollowUpNotesModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelFindFirstOrThrowArgs} args - Arguments to find a LeadFollowUpNotesModel
     * @example
     * // Get one LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeadFollowUpNotesModelFindFirstOrThrowArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LeadFollowUpNotesModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LeadFollowUpNotesModels
     * const leadFollowUpNotesModels = await prisma.leadFollowUpNotesModel.findMany()
     * 
     * // Get first 10 LeadFollowUpNotesModels
     * const leadFollowUpNotesModels = await prisma.leadFollowUpNotesModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leadFollowUpNotesModelWithIdOnly = await prisma.leadFollowUpNotesModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeadFollowUpNotesModelFindManyArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LeadFollowUpNotesModel.
     * @param {LeadFollowUpNotesModelCreateArgs} args - Arguments to create a LeadFollowUpNotesModel.
     * @example
     * // Create one LeadFollowUpNotesModel
     * const LeadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.create({
     *   data: {
     *     // ... data to create a LeadFollowUpNotesModel
     *   }
     * })
     * 
     */
    create<T extends LeadFollowUpNotesModelCreateArgs>(args: SelectSubset<T, LeadFollowUpNotesModelCreateArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LeadFollowUpNotesModels.
     * @param {LeadFollowUpNotesModelCreateManyArgs} args - Arguments to create many LeadFollowUpNotesModels.
     * @example
     * // Create many LeadFollowUpNotesModels
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeadFollowUpNotesModelCreateManyArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LeadFollowUpNotesModels and returns the data saved in the database.
     * @param {LeadFollowUpNotesModelCreateManyAndReturnArgs} args - Arguments to create many LeadFollowUpNotesModels.
     * @example
     * // Create many LeadFollowUpNotesModels
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LeadFollowUpNotesModels and only return the `id`
     * const leadFollowUpNotesModelWithIdOnly = await prisma.leadFollowUpNotesModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeadFollowUpNotesModelCreateManyAndReturnArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LeadFollowUpNotesModel.
     * @param {LeadFollowUpNotesModelDeleteArgs} args - Arguments to delete one LeadFollowUpNotesModel.
     * @example
     * // Delete one LeadFollowUpNotesModel
     * const LeadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.delete({
     *   where: {
     *     // ... filter to delete one LeadFollowUpNotesModel
     *   }
     * })
     * 
     */
    delete<T extends LeadFollowUpNotesModelDeleteArgs>(args: SelectSubset<T, LeadFollowUpNotesModelDeleteArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LeadFollowUpNotesModel.
     * @param {LeadFollowUpNotesModelUpdateArgs} args - Arguments to update one LeadFollowUpNotesModel.
     * @example
     * // Update one LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeadFollowUpNotesModelUpdateArgs>(args: SelectSubset<T, LeadFollowUpNotesModelUpdateArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LeadFollowUpNotesModels.
     * @param {LeadFollowUpNotesModelDeleteManyArgs} args - Arguments to filter LeadFollowUpNotesModels to delete.
     * @example
     * // Delete a few LeadFollowUpNotesModels
     * const { count } = await prisma.leadFollowUpNotesModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeadFollowUpNotesModelDeleteManyArgs>(args?: SelectSubset<T, LeadFollowUpNotesModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeadFollowUpNotesModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LeadFollowUpNotesModels
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeadFollowUpNotesModelUpdateManyArgs>(args: SelectSubset<T, LeadFollowUpNotesModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeadFollowUpNotesModels and returns the data updated in the database.
     * @param {LeadFollowUpNotesModelUpdateManyAndReturnArgs} args - Arguments to update many LeadFollowUpNotesModels.
     * @example
     * // Update many LeadFollowUpNotesModels
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LeadFollowUpNotesModels and only return the `id`
     * const leadFollowUpNotesModelWithIdOnly = await prisma.leadFollowUpNotesModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LeadFollowUpNotesModelUpdateManyAndReturnArgs>(args: SelectSubset<T, LeadFollowUpNotesModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LeadFollowUpNotesModel.
     * @param {LeadFollowUpNotesModelUpsertArgs} args - Arguments to update or create a LeadFollowUpNotesModel.
     * @example
     * // Update or create a LeadFollowUpNotesModel
     * const leadFollowUpNotesModel = await prisma.leadFollowUpNotesModel.upsert({
     *   create: {
     *     // ... data to create a LeadFollowUpNotesModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LeadFollowUpNotesModel we want to update
     *   }
     * })
     */
    upsert<T extends LeadFollowUpNotesModelUpsertArgs>(args: SelectSubset<T, LeadFollowUpNotesModelUpsertArgs<ExtArgs>>): Prisma__LeadFollowUpNotesModelClient<$Result.GetResult<Prisma.$LeadFollowUpNotesModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LeadFollowUpNotesModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelCountArgs} args - Arguments to filter LeadFollowUpNotesModels to count.
     * @example
     * // Count the number of LeadFollowUpNotesModels
     * const count = await prisma.leadFollowUpNotesModel.count({
     *   where: {
     *     // ... the filter for the LeadFollowUpNotesModels we want to count
     *   }
     * })
    **/
    count<T extends LeadFollowUpNotesModelCountArgs>(
      args?: Subset<T, LeadFollowUpNotesModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeadFollowUpNotesModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LeadFollowUpNotesModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeadFollowUpNotesModelAggregateArgs>(args: Subset<T, LeadFollowUpNotesModelAggregateArgs>): Prisma.PrismaPromise<GetLeadFollowUpNotesModelAggregateType<T>>

    /**
     * Group by LeadFollowUpNotesModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFollowUpNotesModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeadFollowUpNotesModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeadFollowUpNotesModelGroupByArgs['orderBy'] }
        : { orderBy?: LeadFollowUpNotesModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeadFollowUpNotesModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeadFollowUpNotesModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LeadFollowUpNotesModel model
   */
  readonly fields: LeadFollowUpNotesModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LeadFollowUpNotesModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeadFollowUpNotesModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LeadFollowUpNotesModel model
   */
  interface LeadFollowUpNotesModelFieldRefs {
    readonly id: FieldRef<"LeadFollowUpNotesModel", 'Int'>
    readonly leadId: FieldRef<"LeadFollowUpNotesModel", 'Int'>
    readonly createdByName: FieldRef<"LeadFollowUpNotesModel", 'String'>
    readonly createdByID: FieldRef<"LeadFollowUpNotesModel", 'Int'>
    readonly text: FieldRef<"LeadFollowUpNotesModel", 'String'>
    readonly nextDate: FieldRef<"LeadFollowUpNotesModel", 'DateTime'>
    readonly createdAt: FieldRef<"LeadFollowUpNotesModel", 'DateTime'>
    readonly updatedAt: FieldRef<"LeadFollowUpNotesModel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LeadFollowUpNotesModel findUnique
   */
  export type LeadFollowUpNotesModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadFollowUpNotesModel to fetch.
     */
    where: LeadFollowUpNotesModelWhereUniqueInput
  }

  /**
   * LeadFollowUpNotesModel findUniqueOrThrow
   */
  export type LeadFollowUpNotesModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadFollowUpNotesModel to fetch.
     */
    where: LeadFollowUpNotesModelWhereUniqueInput
  }

  /**
   * LeadFollowUpNotesModel findFirst
   */
  export type LeadFollowUpNotesModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadFollowUpNotesModel to fetch.
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadFollowUpNotesModels to fetch.
     */
    orderBy?: LeadFollowUpNotesModelOrderByWithRelationInput | LeadFollowUpNotesModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeadFollowUpNotesModels.
     */
    cursor?: LeadFollowUpNotesModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadFollowUpNotesModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadFollowUpNotesModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeadFollowUpNotesModels.
     */
    distinct?: LeadFollowUpNotesModelScalarFieldEnum | LeadFollowUpNotesModelScalarFieldEnum[]
  }

  /**
   * LeadFollowUpNotesModel findFirstOrThrow
   */
  export type LeadFollowUpNotesModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadFollowUpNotesModel to fetch.
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadFollowUpNotesModels to fetch.
     */
    orderBy?: LeadFollowUpNotesModelOrderByWithRelationInput | LeadFollowUpNotesModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeadFollowUpNotesModels.
     */
    cursor?: LeadFollowUpNotesModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadFollowUpNotesModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadFollowUpNotesModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeadFollowUpNotesModels.
     */
    distinct?: LeadFollowUpNotesModelScalarFieldEnum | LeadFollowUpNotesModelScalarFieldEnum[]
  }

  /**
   * LeadFollowUpNotesModel findMany
   */
  export type LeadFollowUpNotesModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter, which LeadFollowUpNotesModels to fetch.
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeadFollowUpNotesModels to fetch.
     */
    orderBy?: LeadFollowUpNotesModelOrderByWithRelationInput | LeadFollowUpNotesModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LeadFollowUpNotesModels.
     */
    cursor?: LeadFollowUpNotesModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeadFollowUpNotesModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeadFollowUpNotesModels.
     */
    skip?: number
    distinct?: LeadFollowUpNotesModelScalarFieldEnum | LeadFollowUpNotesModelScalarFieldEnum[]
  }

  /**
   * LeadFollowUpNotesModel create
   */
  export type LeadFollowUpNotesModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * The data needed to create a LeadFollowUpNotesModel.
     */
    data: XOR<LeadFollowUpNotesModelCreateInput, LeadFollowUpNotesModelUncheckedCreateInput>
  }

  /**
   * LeadFollowUpNotesModel createMany
   */
  export type LeadFollowUpNotesModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LeadFollowUpNotesModels.
     */
    data: LeadFollowUpNotesModelCreateManyInput | LeadFollowUpNotesModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeadFollowUpNotesModel createManyAndReturn
   */
  export type LeadFollowUpNotesModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * The data used to create many LeadFollowUpNotesModels.
     */
    data: LeadFollowUpNotesModelCreateManyInput | LeadFollowUpNotesModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeadFollowUpNotesModel update
   */
  export type LeadFollowUpNotesModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * The data needed to update a LeadFollowUpNotesModel.
     */
    data: XOR<LeadFollowUpNotesModelUpdateInput, LeadFollowUpNotesModelUncheckedUpdateInput>
    /**
     * Choose, which LeadFollowUpNotesModel to update.
     */
    where: LeadFollowUpNotesModelWhereUniqueInput
  }

  /**
   * LeadFollowUpNotesModel updateMany
   */
  export type LeadFollowUpNotesModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LeadFollowUpNotesModels.
     */
    data: XOR<LeadFollowUpNotesModelUpdateManyMutationInput, LeadFollowUpNotesModelUncheckedUpdateManyInput>
    /**
     * Filter which LeadFollowUpNotesModels to update
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * Limit how many LeadFollowUpNotesModels to update.
     */
    limit?: number
  }

  /**
   * LeadFollowUpNotesModel updateManyAndReturn
   */
  export type LeadFollowUpNotesModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * The data used to update LeadFollowUpNotesModels.
     */
    data: XOR<LeadFollowUpNotesModelUpdateManyMutationInput, LeadFollowUpNotesModelUncheckedUpdateManyInput>
    /**
     * Filter which LeadFollowUpNotesModels to update
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * Limit how many LeadFollowUpNotesModels to update.
     */
    limit?: number
  }

  /**
   * LeadFollowUpNotesModel upsert
   */
  export type LeadFollowUpNotesModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * The filter to search for the LeadFollowUpNotesModel to update in case it exists.
     */
    where: LeadFollowUpNotesModelWhereUniqueInput
    /**
     * In case the LeadFollowUpNotesModel found by the `where` argument doesn't exist, create a new LeadFollowUpNotesModel with this data.
     */
    create: XOR<LeadFollowUpNotesModelCreateInput, LeadFollowUpNotesModelUncheckedCreateInput>
    /**
     * In case the LeadFollowUpNotesModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeadFollowUpNotesModelUpdateInput, LeadFollowUpNotesModelUncheckedUpdateInput>
  }

  /**
   * LeadFollowUpNotesModel delete
   */
  export type LeadFollowUpNotesModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
    /**
     * Filter which LeadFollowUpNotesModel to delete.
     */
    where: LeadFollowUpNotesModelWhereUniqueInput
  }

  /**
   * LeadFollowUpNotesModel deleteMany
   */
  export type LeadFollowUpNotesModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeadFollowUpNotesModels to delete
     */
    where?: LeadFollowUpNotesModelWhereInput
    /**
     * Limit how many LeadFollowUpNotesModels to delete.
     */
    limit?: number
  }

  /**
   * LeadFollowUpNotesModel without action
   */
  export type LeadFollowUpNotesModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadFollowUpNotesModel
     */
    select?: LeadFollowUpNotesModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeadFollowUpNotesModel
     */
    omit?: LeadFollowUpNotesModelOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CRMUserDataModelScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    phoneNo: 'phoneNo',
    avatar: 'avatar',
    lastLogin: 'lastLogin',
    role: 'role',
    accountStatus: 'accountStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type CRMUserDataModelScalarFieldEnum = (typeof CRMUserDataModelScalarFieldEnum)[keyof typeof CRMUserDataModelScalarFieldEnum]


  export const CustomersAuthDataModelScalarFieldEnum: {
    id: 'id',
    password: 'password',
    signinWith: 'signinWith',
    accountStatus: 'accountStatus',
    isPhoneVerified: 'isPhoneVerified',
    isEmailVerified: 'isEmailVerified',
    whatsAppNotificationAllow: 'whatsAppNotificationAllow',
    termsAccepted: 'termsAccepted',
    lastLogin: 'lastLogin',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomersAuthDataModelScalarFieldEnum = (typeof CustomersAuthDataModelScalarFieldEnum)[keyof typeof CustomersAuthDataModelScalarFieldEnum]


  export const CustomerProfileDataModelScalarFieldEnum: {
    id: 'id',
    userName: 'userName',
    firstName: 'firstName',
    middleName: 'middleName',
    lastName: 'lastName',
    gender: 'gender',
    emailAddress: 'emailAddress',
    phoneNo: 'phoneNo',
    whatsAppNo: 'whatsAppNo',
    avatar: 'avatar',
    userType: 'userType',
    kycStatus: 'kycStatus',
    VerifiedBy: 'VerifiedBy',
    customersAuthDataModelId: 'customersAuthDataModelId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy',
    aADHAARCardModelId: 'aADHAARCardModelId',
    panCardModelId: 'panCardModelId',
    customerPersonalInfoModelId: 'customerPersonalInfoModelId',
    currentAddressModelId: 'currentAddressModelId',
    permanentAddressModelId: 'permanentAddressModelId'
  };

  export type CustomerProfileDataModelScalarFieldEnum = (typeof CustomerProfileDataModelScalarFieldEnum)[keyof typeof CustomerProfileDataModelScalarFieldEnum]


  export const CustomerPersonalInfoModelScalarFieldEnum: {
    id: 'id',
    SignatureUrl: 'SignatureUrl',
    maritalStatus: 'maritalStatus',
    occupationType: 'occupationType',
    annualGrossIncome: 'annualGrossIncome',
    fatherOrSpouseName: 'fatherOrSpouseName',
    mothersName: 'mothersName',
    nationality: 'nationality',
    maidenName: 'maidenName',
    residentialStatus: 'residentialStatus',
    qualification: 'qualification',
    politicallyExposedPerson: 'politicallyExposedPerson',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomerPersonalInfoModelScalarFieldEnum = (typeof CustomerPersonalInfoModelScalarFieldEnum)[keyof typeof CustomerPersonalInfoModelScalarFieldEnum]


  export const AADHAARCardModelScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    middleName: 'middleName',
    lastName: 'lastName',
    fatherName: 'fatherName',
    aadhaarNo: 'aadhaarNo',
    dateOfBirth: 'dateOfBirth',
    gender: 'gender',
    image: 'image',
    isVerified: 'isVerified',
    verifyDate: 'verifyDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AADHAARCardModelScalarFieldEnum = (typeof AADHAARCardModelScalarFieldEnum)[keyof typeof AADHAARCardModelScalarFieldEnum]


  export const PanCardModelScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    middleName: 'middleName',
    lastName: 'lastName',
    panCardNo: 'panCardNo',
    dateOfBirth: 'dateOfBirth',
    gender: 'gender',
    isVerified: 'isVerified',
    verifyDate: 'verifyDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PanCardModelScalarFieldEnum = (typeof PanCardModelScalarFieldEnum)[keyof typeof PanCardModelScalarFieldEnum]


  export const CustomersBankAccountModelScalarFieldEnum: {
    id: 'id',
    accountHolderName: 'accountHolderName',
    bankAccountType: 'bankAccountType',
    accountNumber: 'accountNumber',
    ifscCode: 'ifscCode',
    bankName: 'bankName',
    branch: 'branch',
    isPrimary: 'isPrimary',
    isVerified: 'isVerified',
    customerProfileDataModelId: 'customerProfileDataModelId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomersBankAccountModelScalarFieldEnum = (typeof CustomersBankAccountModelScalarFieldEnum)[keyof typeof CustomersBankAccountModelScalarFieldEnum]


  export const CustomersDematAccountModelScalarFieldEnum: {
    id: 'id',
    depositoryName: 'depositoryName',
    dpId: 'dpId',
    clientId: 'clientId',
    accountType: 'accountType',
    depositoryParticipantName: 'depositoryParticipantName',
    primaryPanNumber: 'primaryPanNumber',
    sndPanNumber: 'sndPanNumber',
    trdPanNumber: 'trdPanNumber',
    accountHolderName: 'accountHolderName',
    isPrimary: 'isPrimary',
    isVerified: 'isVerified',
    customerProfileDataModelId: 'customerProfileDataModelId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomersDematAccountModelScalarFieldEnum = (typeof CustomersDematAccountModelScalarFieldEnum)[keyof typeof CustomersDematAccountModelScalarFieldEnum]


  export const CustomersRiskProfileModelScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustomersRiskProfileModelScalarFieldEnum = (typeof CustomersRiskProfileModelScalarFieldEnum)[keyof typeof CustomersRiskProfileModelScalarFieldEnum]


  export const AddressModelScalarFieldEnum: {
    id: 'id',
    line1: 'line1',
    line2: 'line2',
    line3: 'line3',
    postOffice: 'postOffice',
    cityOrDistrict: 'cityOrDistrict',
    state: 'state',
    pinCode: 'pinCode',
    country: 'country',
    fullAddress: 'fullAddress',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AddressModelScalarFieldEnum = (typeof AddressModelScalarFieldEnum)[keyof typeof AddressModelScalarFieldEnum]


  export const LeadsModelScalarFieldEnum: {
    id: 'id',
    fullName: 'fullName',
    emailAddress: 'emailAddress',
    phoneNo: 'phoneNo',
    companyName: 'companyName',
    leadSource: 'leadSource',
    bondType: 'bondType',
    status: 'status',
    exInvestmentAmount: 'exInvestmentAmount',
    note: 'note',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LeadsModelScalarFieldEnum = (typeof LeadsModelScalarFieldEnum)[keyof typeof LeadsModelScalarFieldEnum]


  export const LeadFollowUpNotesModelScalarFieldEnum: {
    id: 'id',
    leadId: 'leadId',
    createdByName: 'createdByName',
    createdByID: 'createdByID',
    text: 'text',
    nextDate: 'nextDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LeadFollowUpNotesModelScalarFieldEnum = (typeof LeadFollowUpNotesModelScalarFieldEnum)[keyof typeof LeadFollowUpNotesModelScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CrmUserROLE'
   */
  export type EnumCrmUserROLEFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CrmUserROLE'>
    


  /**
   * Reference to a field of type 'CrmUserROLE[]'
   */
  export type ListEnumCrmUserROLEFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CrmUserROLE[]'>
    


  /**
   * Reference to a field of type 'AccountStatus'
   */
  export type EnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountStatus'>
    


  /**
   * Reference to a field of type 'AccountStatus[]'
   */
  export type ListEnumAccountStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountStatus[]'>
    


  /**
   * Reference to a field of type 'SIGNIN_WITH'
   */
  export type EnumSIGNIN_WITHFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SIGNIN_WITH'>
    


  /**
   * Reference to a field of type 'SIGNIN_WITH[]'
   */
  export type ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SIGNIN_WITH[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Gender'
   */
  export type EnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender'>
    


  /**
   * Reference to a field of type 'Gender[]'
   */
  export type ListEnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender[]'>
    


  /**
   * Reference to a field of type 'UserAccountType'
   */
  export type EnumUserAccountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserAccountType'>
    


  /**
   * Reference to a field of type 'UserAccountType[]'
   */
  export type ListEnumUserAccountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserAccountType[]'>
    


  /**
   * Reference to a field of type 'KYCStatus'
   */
  export type EnumKYCStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KYCStatus'>
    


  /**
   * Reference to a field of type 'KYCStatus[]'
   */
  export type ListEnumKYCStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'KYCStatus[]'>
    


  /**
   * Reference to a field of type 'DepositoryName'
   */
  export type EnumDepositoryNameFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DepositoryName'>
    


  /**
   * Reference to a field of type 'DepositoryName[]'
   */
  export type ListEnumDepositoryNameFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DepositoryName[]'>
    


  /**
   * Reference to a field of type 'DematAccountType'
   */
  export type EnumDematAccountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DematAccountType'>
    


  /**
   * Reference to a field of type 'DematAccountType[]'
   */
  export type ListEnumDematAccountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DematAccountType[]'>
    


  /**
   * Reference to a field of type 'LeadSource'
   */
  export type EnumLeadSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadSource'>
    


  /**
   * Reference to a field of type 'LeadSource[]'
   */
  export type ListEnumLeadSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadSource[]'>
    


  /**
   * Reference to a field of type 'BondType'
   */
  export type EnumBondTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BondType'>
    


  /**
   * Reference to a field of type 'BondType[]'
   */
  export type ListEnumBondTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BondType[]'>
    


  /**
   * Reference to a field of type 'LeadStatus'
   */
  export type EnumLeadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadStatus'>
    


  /**
   * Reference to a field of type 'LeadStatus[]'
   */
  export type ListEnumLeadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CRMUserDataModelWhereInput = {
    AND?: CRMUserDataModelWhereInput | CRMUserDataModelWhereInput[]
    OR?: CRMUserDataModelWhereInput[]
    NOT?: CRMUserDataModelWhereInput | CRMUserDataModelWhereInput[]
    id?: IntFilter<"CRMUserDataModel"> | number
    name?: StringFilter<"CRMUserDataModel"> | string
    email?: StringFilter<"CRMUserDataModel"> | string
    phoneNo?: StringFilter<"CRMUserDataModel"> | string
    avatar?: StringNullableFilter<"CRMUserDataModel"> | string | null
    lastLogin?: DateTimeNullableFilter<"CRMUserDataModel"> | Date | string | null
    role?: EnumCrmUserROLEFilter<"CRMUserDataModel"> | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFilter<"CRMUserDataModel"> | $Enums.AccountStatus
    createdAt?: DateTimeFilter<"CRMUserDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CRMUserDataModel"> | Date | string
    createdBy?: IntNullableFilter<"CRMUserDataModel"> | number | null
  }

  export type CRMUserDataModelOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phoneNo?: SortOrder
    avatar?: SortOrderInput | SortOrder
    lastLogin?: SortOrderInput | SortOrder
    role?: SortOrder
    accountStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
  }

  export type CRMUserDataModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: CRMUserDataModelWhereInput | CRMUserDataModelWhereInput[]
    OR?: CRMUserDataModelWhereInput[]
    NOT?: CRMUserDataModelWhereInput | CRMUserDataModelWhereInput[]
    name?: StringFilter<"CRMUserDataModel"> | string
    phoneNo?: StringFilter<"CRMUserDataModel"> | string
    avatar?: StringNullableFilter<"CRMUserDataModel"> | string | null
    lastLogin?: DateTimeNullableFilter<"CRMUserDataModel"> | Date | string | null
    role?: EnumCrmUserROLEFilter<"CRMUserDataModel"> | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFilter<"CRMUserDataModel"> | $Enums.AccountStatus
    createdAt?: DateTimeFilter<"CRMUserDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CRMUserDataModel"> | Date | string
    createdBy?: IntNullableFilter<"CRMUserDataModel"> | number | null
  }, "id" | "email">

  export type CRMUserDataModelOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phoneNo?: SortOrder
    avatar?: SortOrderInput | SortOrder
    lastLogin?: SortOrderInput | SortOrder
    role?: SortOrder
    accountStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    _count?: CRMUserDataModelCountOrderByAggregateInput
    _avg?: CRMUserDataModelAvgOrderByAggregateInput
    _max?: CRMUserDataModelMaxOrderByAggregateInput
    _min?: CRMUserDataModelMinOrderByAggregateInput
    _sum?: CRMUserDataModelSumOrderByAggregateInput
  }

  export type CRMUserDataModelScalarWhereWithAggregatesInput = {
    AND?: CRMUserDataModelScalarWhereWithAggregatesInput | CRMUserDataModelScalarWhereWithAggregatesInput[]
    OR?: CRMUserDataModelScalarWhereWithAggregatesInput[]
    NOT?: CRMUserDataModelScalarWhereWithAggregatesInput | CRMUserDataModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CRMUserDataModel"> | number
    name?: StringWithAggregatesFilter<"CRMUserDataModel"> | string
    email?: StringWithAggregatesFilter<"CRMUserDataModel"> | string
    phoneNo?: StringWithAggregatesFilter<"CRMUserDataModel"> | string
    avatar?: StringNullableWithAggregatesFilter<"CRMUserDataModel"> | string | null
    lastLogin?: DateTimeNullableWithAggregatesFilter<"CRMUserDataModel"> | Date | string | null
    role?: EnumCrmUserROLEWithAggregatesFilter<"CRMUserDataModel"> | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusWithAggregatesFilter<"CRMUserDataModel"> | $Enums.AccountStatus
    createdAt?: DateTimeWithAggregatesFilter<"CRMUserDataModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CRMUserDataModel"> | Date | string
    createdBy?: IntNullableWithAggregatesFilter<"CRMUserDataModel"> | number | null
  }

  export type CustomersAuthDataModelWhereInput = {
    AND?: CustomersAuthDataModelWhereInput | CustomersAuthDataModelWhereInput[]
    OR?: CustomersAuthDataModelWhereInput[]
    NOT?: CustomersAuthDataModelWhereInput | CustomersAuthDataModelWhereInput[]
    id?: IntFilter<"CustomersAuthDataModel"> | number
    password?: StringNullableFilter<"CustomersAuthDataModel"> | string | null
    signinWith?: EnumSIGNIN_WITHFilter<"CustomersAuthDataModel"> | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFilter<"CustomersAuthDataModel"> | $Enums.AccountStatus
    isPhoneVerified?: BoolFilter<"CustomersAuthDataModel"> | boolean
    isEmailVerified?: BoolFilter<"CustomersAuthDataModel"> | boolean
    whatsAppNotificationAllow?: BoolFilter<"CustomersAuthDataModel"> | boolean
    termsAccepted?: BoolFilter<"CustomersAuthDataModel"> | boolean
    lastLogin?: DateTimeNullableFilter<"CustomersAuthDataModel"> | Date | string | null
    createdAt?: DateTimeFilter<"CustomersAuthDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersAuthDataModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }

  export type CustomersAuthDataModelOrderByWithRelationInput = {
    id?: SortOrder
    password?: SortOrderInput | SortOrder
    signinWith?: SortOrder
    accountStatus?: SortOrder
    isPhoneVerified?: SortOrder
    isEmailVerified?: SortOrder
    whatsAppNotificationAllow?: SortOrder
    termsAccepted?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByRelationAggregateInput
  }

  export type CustomersAuthDataModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomersAuthDataModelWhereInput | CustomersAuthDataModelWhereInput[]
    OR?: CustomersAuthDataModelWhereInput[]
    NOT?: CustomersAuthDataModelWhereInput | CustomersAuthDataModelWhereInput[]
    password?: StringNullableFilter<"CustomersAuthDataModel"> | string | null
    signinWith?: EnumSIGNIN_WITHFilter<"CustomersAuthDataModel"> | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFilter<"CustomersAuthDataModel"> | $Enums.AccountStatus
    isPhoneVerified?: BoolFilter<"CustomersAuthDataModel"> | boolean
    isEmailVerified?: BoolFilter<"CustomersAuthDataModel"> | boolean
    whatsAppNotificationAllow?: BoolFilter<"CustomersAuthDataModel"> | boolean
    termsAccepted?: BoolFilter<"CustomersAuthDataModel"> | boolean
    lastLogin?: DateTimeNullableFilter<"CustomersAuthDataModel"> | Date | string | null
    createdAt?: DateTimeFilter<"CustomersAuthDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersAuthDataModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }, "id">

  export type CustomersAuthDataModelOrderByWithAggregationInput = {
    id?: SortOrder
    password?: SortOrderInput | SortOrder
    signinWith?: SortOrder
    accountStatus?: SortOrder
    isPhoneVerified?: SortOrder
    isEmailVerified?: SortOrder
    whatsAppNotificationAllow?: SortOrder
    termsAccepted?: SortOrder
    lastLogin?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomersAuthDataModelCountOrderByAggregateInput
    _avg?: CustomersAuthDataModelAvgOrderByAggregateInput
    _max?: CustomersAuthDataModelMaxOrderByAggregateInput
    _min?: CustomersAuthDataModelMinOrderByAggregateInput
    _sum?: CustomersAuthDataModelSumOrderByAggregateInput
  }

  export type CustomersAuthDataModelScalarWhereWithAggregatesInput = {
    AND?: CustomersAuthDataModelScalarWhereWithAggregatesInput | CustomersAuthDataModelScalarWhereWithAggregatesInput[]
    OR?: CustomersAuthDataModelScalarWhereWithAggregatesInput[]
    NOT?: CustomersAuthDataModelScalarWhereWithAggregatesInput | CustomersAuthDataModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomersAuthDataModel"> | number
    password?: StringNullableWithAggregatesFilter<"CustomersAuthDataModel"> | string | null
    signinWith?: EnumSIGNIN_WITHWithAggregatesFilter<"CustomersAuthDataModel"> | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusWithAggregatesFilter<"CustomersAuthDataModel"> | $Enums.AccountStatus
    isPhoneVerified?: BoolWithAggregatesFilter<"CustomersAuthDataModel"> | boolean
    isEmailVerified?: BoolWithAggregatesFilter<"CustomersAuthDataModel"> | boolean
    whatsAppNotificationAllow?: BoolWithAggregatesFilter<"CustomersAuthDataModel"> | boolean
    termsAccepted?: BoolWithAggregatesFilter<"CustomersAuthDataModel"> | boolean
    lastLogin?: DateTimeNullableWithAggregatesFilter<"CustomersAuthDataModel"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CustomersAuthDataModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomersAuthDataModel"> | Date | string
  }

  export type CustomerProfileDataModelWhereInput = {
    AND?: CustomerProfileDataModelWhereInput | CustomerProfileDataModelWhereInput[]
    OR?: CustomerProfileDataModelWhereInput[]
    NOT?: CustomerProfileDataModelWhereInput | CustomerProfileDataModelWhereInput[]
    id?: IntFilter<"CustomerProfileDataModel"> | number
    userName?: StringFilter<"CustomerProfileDataModel"> | string
    firstName?: StringFilter<"CustomerProfileDataModel"> | string
    middleName?: StringFilter<"CustomerProfileDataModel"> | string
    lastName?: StringFilter<"CustomerProfileDataModel"> | string
    gender?: EnumGenderFilter<"CustomerProfileDataModel"> | $Enums.Gender
    emailAddress?: StringFilter<"CustomerProfileDataModel"> | string
    phoneNo?: StringFilter<"CustomerProfileDataModel"> | string
    whatsAppNo?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    avatar?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    userType?: EnumUserAccountTypeFilter<"CustomerProfileDataModel"> | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFilter<"CustomerProfileDataModel"> | $Enums.KYCStatus
    VerifiedBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customersAuthDataModelId?: IntFilter<"CustomerProfileDataModel"> | number
    createdAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    createdBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    aADHAARCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    panCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customerPersonalInfoModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    currentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    permanentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    utility?: XOR<CustomersAuthDataModelScalarRelationFilter, CustomersAuthDataModelWhereInput>
    aadhaarCard?: XOR<AADHAARCardModelNullableScalarRelationFilter, AADHAARCardModelWhereInput> | null
    panCard?: XOR<PanCardModelNullableScalarRelationFilter, PanCardModelWhereInput> | null
    personalInformation?: XOR<CustomerPersonalInfoModelNullableScalarRelationFilter, CustomerPersonalInfoModelWhereInput> | null
    bankAccounts?: CustomersBankAccountModelListRelationFilter
    dematAccounts?: CustomersDematAccountModelListRelationFilter
    currentAddress?: XOR<AddressModelNullableScalarRelationFilter, AddressModelWhereInput> | null
    permanentAddress?: XOR<AddressModelNullableScalarRelationFilter, AddressModelWhereInput> | null
  }

  export type CustomerProfileDataModelOrderByWithRelationInput = {
    id?: SortOrder
    userName?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    gender?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    whatsAppNo?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    userType?: SortOrder
    kycStatus?: SortOrder
    VerifiedBy?: SortOrderInput | SortOrder
    customersAuthDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    aADHAARCardModelId?: SortOrderInput | SortOrder
    panCardModelId?: SortOrderInput | SortOrder
    customerPersonalInfoModelId?: SortOrderInput | SortOrder
    currentAddressModelId?: SortOrderInput | SortOrder
    permanentAddressModelId?: SortOrderInput | SortOrder
    utility?: CustomersAuthDataModelOrderByWithRelationInput
    aadhaarCard?: AADHAARCardModelOrderByWithRelationInput
    panCard?: PanCardModelOrderByWithRelationInput
    personalInformation?: CustomerPersonalInfoModelOrderByWithRelationInput
    bankAccounts?: CustomersBankAccountModelOrderByRelationAggregateInput
    dematAccounts?: CustomersDematAccountModelOrderByRelationAggregateInput
    currentAddress?: AddressModelOrderByWithRelationInput
    permanentAddress?: AddressModelOrderByWithRelationInput
  }

  export type CustomerProfileDataModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userName?: string
    emailAddress?: string
    AND?: CustomerProfileDataModelWhereInput | CustomerProfileDataModelWhereInput[]
    OR?: CustomerProfileDataModelWhereInput[]
    NOT?: CustomerProfileDataModelWhereInput | CustomerProfileDataModelWhereInput[]
    firstName?: StringFilter<"CustomerProfileDataModel"> | string
    middleName?: StringFilter<"CustomerProfileDataModel"> | string
    lastName?: StringFilter<"CustomerProfileDataModel"> | string
    gender?: EnumGenderFilter<"CustomerProfileDataModel"> | $Enums.Gender
    phoneNo?: StringFilter<"CustomerProfileDataModel"> | string
    whatsAppNo?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    avatar?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    userType?: EnumUserAccountTypeFilter<"CustomerProfileDataModel"> | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFilter<"CustomerProfileDataModel"> | $Enums.KYCStatus
    VerifiedBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customersAuthDataModelId?: IntFilter<"CustomerProfileDataModel"> | number
    createdAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    createdBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    aADHAARCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    panCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customerPersonalInfoModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    currentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    permanentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    utility?: XOR<CustomersAuthDataModelScalarRelationFilter, CustomersAuthDataModelWhereInput>
    aadhaarCard?: XOR<AADHAARCardModelNullableScalarRelationFilter, AADHAARCardModelWhereInput> | null
    panCard?: XOR<PanCardModelNullableScalarRelationFilter, PanCardModelWhereInput> | null
    personalInformation?: XOR<CustomerPersonalInfoModelNullableScalarRelationFilter, CustomerPersonalInfoModelWhereInput> | null
    bankAccounts?: CustomersBankAccountModelListRelationFilter
    dematAccounts?: CustomersDematAccountModelListRelationFilter
    currentAddress?: XOR<AddressModelNullableScalarRelationFilter, AddressModelWhereInput> | null
    permanentAddress?: XOR<AddressModelNullableScalarRelationFilter, AddressModelWhereInput> | null
  }, "id" | "userName" | "emailAddress">

  export type CustomerProfileDataModelOrderByWithAggregationInput = {
    id?: SortOrder
    userName?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    gender?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    whatsAppNo?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    userType?: SortOrder
    kycStatus?: SortOrder
    VerifiedBy?: SortOrderInput | SortOrder
    customersAuthDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    aADHAARCardModelId?: SortOrderInput | SortOrder
    panCardModelId?: SortOrderInput | SortOrder
    customerPersonalInfoModelId?: SortOrderInput | SortOrder
    currentAddressModelId?: SortOrderInput | SortOrder
    permanentAddressModelId?: SortOrderInput | SortOrder
    _count?: CustomerProfileDataModelCountOrderByAggregateInput
    _avg?: CustomerProfileDataModelAvgOrderByAggregateInput
    _max?: CustomerProfileDataModelMaxOrderByAggregateInput
    _min?: CustomerProfileDataModelMinOrderByAggregateInput
    _sum?: CustomerProfileDataModelSumOrderByAggregateInput
  }

  export type CustomerProfileDataModelScalarWhereWithAggregatesInput = {
    AND?: CustomerProfileDataModelScalarWhereWithAggregatesInput | CustomerProfileDataModelScalarWhereWithAggregatesInput[]
    OR?: CustomerProfileDataModelScalarWhereWithAggregatesInput[]
    NOT?: CustomerProfileDataModelScalarWhereWithAggregatesInput | CustomerProfileDataModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomerProfileDataModel"> | number
    userName?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    firstName?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    middleName?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    lastName?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    gender?: EnumGenderWithAggregatesFilter<"CustomerProfileDataModel"> | $Enums.Gender
    emailAddress?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    phoneNo?: StringWithAggregatesFilter<"CustomerProfileDataModel"> | string
    whatsAppNo?: StringNullableWithAggregatesFilter<"CustomerProfileDataModel"> | string | null
    avatar?: StringNullableWithAggregatesFilter<"CustomerProfileDataModel"> | string | null
    userType?: EnumUserAccountTypeWithAggregatesFilter<"CustomerProfileDataModel"> | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusWithAggregatesFilter<"CustomerProfileDataModel"> | $Enums.KYCStatus
    VerifiedBy?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    customersAuthDataModelId?: IntWithAggregatesFilter<"CustomerProfileDataModel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CustomerProfileDataModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomerProfileDataModel"> | Date | string
    createdBy?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    aADHAARCardModelId?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    panCardModelId?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    customerPersonalInfoModelId?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    currentAddressModelId?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
    permanentAddressModelId?: IntNullableWithAggregatesFilter<"CustomerProfileDataModel"> | number | null
  }

  export type CustomerPersonalInfoModelWhereInput = {
    AND?: CustomerPersonalInfoModelWhereInput | CustomerPersonalInfoModelWhereInput[]
    OR?: CustomerPersonalInfoModelWhereInput[]
    NOT?: CustomerPersonalInfoModelWhereInput | CustomerPersonalInfoModelWhereInput[]
    id?: IntFilter<"CustomerPersonalInfoModel"> | number
    SignatureUrl?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    maritalStatus?: StringFilter<"CustomerPersonalInfoModel"> | string
    occupationType?: StringFilter<"CustomerPersonalInfoModel"> | string
    annualGrossIncome?: StringFilter<"CustomerPersonalInfoModel"> | string
    fatherOrSpouseName?: StringFilter<"CustomerPersonalInfoModel"> | string
    mothersName?: StringFilter<"CustomerPersonalInfoModel"> | string
    nationality?: StringFilter<"CustomerPersonalInfoModel"> | string
    maidenName?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    residentialStatus?: StringFilter<"CustomerPersonalInfoModel"> | string
    qualification?: StringFilter<"CustomerPersonalInfoModel"> | string
    politicallyExposedPerson?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    createdAt?: DateTimeFilter<"CustomerPersonalInfoModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomerPersonalInfoModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }

  export type CustomerPersonalInfoModelOrderByWithRelationInput = {
    id?: SortOrder
    SignatureUrl?: SortOrderInput | SortOrder
    maritalStatus?: SortOrder
    occupationType?: SortOrder
    annualGrossIncome?: SortOrder
    fatherOrSpouseName?: SortOrder
    mothersName?: SortOrder
    nationality?: SortOrder
    maidenName?: SortOrderInput | SortOrder
    residentialStatus?: SortOrder
    qualification?: SortOrder
    politicallyExposedPerson?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByRelationAggregateInput
  }

  export type CustomerPersonalInfoModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomerPersonalInfoModelWhereInput | CustomerPersonalInfoModelWhereInput[]
    OR?: CustomerPersonalInfoModelWhereInput[]
    NOT?: CustomerPersonalInfoModelWhereInput | CustomerPersonalInfoModelWhereInput[]
    SignatureUrl?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    maritalStatus?: StringFilter<"CustomerPersonalInfoModel"> | string
    occupationType?: StringFilter<"CustomerPersonalInfoModel"> | string
    annualGrossIncome?: StringFilter<"CustomerPersonalInfoModel"> | string
    fatherOrSpouseName?: StringFilter<"CustomerPersonalInfoModel"> | string
    mothersName?: StringFilter<"CustomerPersonalInfoModel"> | string
    nationality?: StringFilter<"CustomerPersonalInfoModel"> | string
    maidenName?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    residentialStatus?: StringFilter<"CustomerPersonalInfoModel"> | string
    qualification?: StringFilter<"CustomerPersonalInfoModel"> | string
    politicallyExposedPerson?: StringNullableFilter<"CustomerPersonalInfoModel"> | string | null
    createdAt?: DateTimeFilter<"CustomerPersonalInfoModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomerPersonalInfoModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }, "id">

  export type CustomerPersonalInfoModelOrderByWithAggregationInput = {
    id?: SortOrder
    SignatureUrl?: SortOrderInput | SortOrder
    maritalStatus?: SortOrder
    occupationType?: SortOrder
    annualGrossIncome?: SortOrder
    fatherOrSpouseName?: SortOrder
    mothersName?: SortOrder
    nationality?: SortOrder
    maidenName?: SortOrderInput | SortOrder
    residentialStatus?: SortOrder
    qualification?: SortOrder
    politicallyExposedPerson?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomerPersonalInfoModelCountOrderByAggregateInput
    _avg?: CustomerPersonalInfoModelAvgOrderByAggregateInput
    _max?: CustomerPersonalInfoModelMaxOrderByAggregateInput
    _min?: CustomerPersonalInfoModelMinOrderByAggregateInput
    _sum?: CustomerPersonalInfoModelSumOrderByAggregateInput
  }

  export type CustomerPersonalInfoModelScalarWhereWithAggregatesInput = {
    AND?: CustomerPersonalInfoModelScalarWhereWithAggregatesInput | CustomerPersonalInfoModelScalarWhereWithAggregatesInput[]
    OR?: CustomerPersonalInfoModelScalarWhereWithAggregatesInput[]
    NOT?: CustomerPersonalInfoModelScalarWhereWithAggregatesInput | CustomerPersonalInfoModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomerPersonalInfoModel"> | number
    SignatureUrl?: StringNullableWithAggregatesFilter<"CustomerPersonalInfoModel"> | string | null
    maritalStatus?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    occupationType?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    annualGrossIncome?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    fatherOrSpouseName?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    mothersName?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    nationality?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    maidenName?: StringNullableWithAggregatesFilter<"CustomerPersonalInfoModel"> | string | null
    residentialStatus?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    qualification?: StringWithAggregatesFilter<"CustomerPersonalInfoModel"> | string
    politicallyExposedPerson?: StringNullableWithAggregatesFilter<"CustomerPersonalInfoModel"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CustomerPersonalInfoModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomerPersonalInfoModel"> | Date | string
  }

  export type AADHAARCardModelWhereInput = {
    AND?: AADHAARCardModelWhereInput | AADHAARCardModelWhereInput[]
    OR?: AADHAARCardModelWhereInput[]
    NOT?: AADHAARCardModelWhereInput | AADHAARCardModelWhereInput[]
    id?: IntFilter<"AADHAARCardModel"> | number
    firstName?: StringFilter<"AADHAARCardModel"> | string
    middleName?: StringFilter<"AADHAARCardModel"> | string
    lastName?: StringFilter<"AADHAARCardModel"> | string
    fatherName?: StringFilter<"AADHAARCardModel"> | string
    aadhaarNo?: StringFilter<"AADHAARCardModel"> | string
    dateOfBirth?: StringFilter<"AADHAARCardModel"> | string
    gender?: EnumGenderFilter<"AADHAARCardModel"> | $Enums.Gender
    image?: StringFilter<"AADHAARCardModel"> | string
    isVerified?: BoolFilter<"AADHAARCardModel"> | boolean
    verifyDate?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    createdAt?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    updatedAt?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }

  export type AADHAARCardModelOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    fatherName?: SortOrder
    aadhaarNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    image?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByRelationAggregateInput
  }

  export type AADHAARCardModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AADHAARCardModelWhereInput | AADHAARCardModelWhereInput[]
    OR?: AADHAARCardModelWhereInput[]
    NOT?: AADHAARCardModelWhereInput | AADHAARCardModelWhereInput[]
    firstName?: StringFilter<"AADHAARCardModel"> | string
    middleName?: StringFilter<"AADHAARCardModel"> | string
    lastName?: StringFilter<"AADHAARCardModel"> | string
    fatherName?: StringFilter<"AADHAARCardModel"> | string
    aadhaarNo?: StringFilter<"AADHAARCardModel"> | string
    dateOfBirth?: StringFilter<"AADHAARCardModel"> | string
    gender?: EnumGenderFilter<"AADHAARCardModel"> | $Enums.Gender
    image?: StringFilter<"AADHAARCardModel"> | string
    isVerified?: BoolFilter<"AADHAARCardModel"> | boolean
    verifyDate?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    createdAt?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    updatedAt?: DateTimeFilter<"AADHAARCardModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }, "id">

  export type AADHAARCardModelOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    fatherName?: SortOrder
    aadhaarNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    image?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AADHAARCardModelCountOrderByAggregateInput
    _avg?: AADHAARCardModelAvgOrderByAggregateInput
    _max?: AADHAARCardModelMaxOrderByAggregateInput
    _min?: AADHAARCardModelMinOrderByAggregateInput
    _sum?: AADHAARCardModelSumOrderByAggregateInput
  }

  export type AADHAARCardModelScalarWhereWithAggregatesInput = {
    AND?: AADHAARCardModelScalarWhereWithAggregatesInput | AADHAARCardModelScalarWhereWithAggregatesInput[]
    OR?: AADHAARCardModelScalarWhereWithAggregatesInput[]
    NOT?: AADHAARCardModelScalarWhereWithAggregatesInput | AADHAARCardModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AADHAARCardModel"> | number
    firstName?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    middleName?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    lastName?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    fatherName?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    aadhaarNo?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    dateOfBirth?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    gender?: EnumGenderWithAggregatesFilter<"AADHAARCardModel"> | $Enums.Gender
    image?: StringWithAggregatesFilter<"AADHAARCardModel"> | string
    isVerified?: BoolWithAggregatesFilter<"AADHAARCardModel"> | boolean
    verifyDate?: DateTimeWithAggregatesFilter<"AADHAARCardModel"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"AADHAARCardModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AADHAARCardModel"> | Date | string
  }

  export type PanCardModelWhereInput = {
    AND?: PanCardModelWhereInput | PanCardModelWhereInput[]
    OR?: PanCardModelWhereInput[]
    NOT?: PanCardModelWhereInput | PanCardModelWhereInput[]
    id?: IntFilter<"PanCardModel"> | number
    firstName?: StringFilter<"PanCardModel"> | string
    middleName?: StringFilter<"PanCardModel"> | string
    lastName?: StringFilter<"PanCardModel"> | string
    panCardNo?: StringFilter<"PanCardModel"> | string
    dateOfBirth?: StringFilter<"PanCardModel"> | string
    gender?: EnumGenderFilter<"PanCardModel"> | $Enums.Gender
    isVerified?: BoolFilter<"PanCardModel"> | boolean
    verifyDate?: DateTimeFilter<"PanCardModel"> | Date | string
    createdAt?: DateTimeFilter<"PanCardModel"> | Date | string
    updatedAt?: DateTimeFilter<"PanCardModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }

  export type PanCardModelOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    panCardNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByRelationAggregateInput
  }

  export type PanCardModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PanCardModelWhereInput | PanCardModelWhereInput[]
    OR?: PanCardModelWhereInput[]
    NOT?: PanCardModelWhereInput | PanCardModelWhereInput[]
    firstName?: StringFilter<"PanCardModel"> | string
    middleName?: StringFilter<"PanCardModel"> | string
    lastName?: StringFilter<"PanCardModel"> | string
    panCardNo?: StringFilter<"PanCardModel"> | string
    dateOfBirth?: StringFilter<"PanCardModel"> | string
    gender?: EnumGenderFilter<"PanCardModel"> | $Enums.Gender
    isVerified?: BoolFilter<"PanCardModel"> | boolean
    verifyDate?: DateTimeFilter<"PanCardModel"> | Date | string
    createdAt?: DateTimeFilter<"PanCardModel"> | Date | string
    updatedAt?: DateTimeFilter<"PanCardModel"> | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelListRelationFilter
  }, "id">

  export type PanCardModelOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    panCardNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PanCardModelCountOrderByAggregateInput
    _avg?: PanCardModelAvgOrderByAggregateInput
    _max?: PanCardModelMaxOrderByAggregateInput
    _min?: PanCardModelMinOrderByAggregateInput
    _sum?: PanCardModelSumOrderByAggregateInput
  }

  export type PanCardModelScalarWhereWithAggregatesInput = {
    AND?: PanCardModelScalarWhereWithAggregatesInput | PanCardModelScalarWhereWithAggregatesInput[]
    OR?: PanCardModelScalarWhereWithAggregatesInput[]
    NOT?: PanCardModelScalarWhereWithAggregatesInput | PanCardModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PanCardModel"> | number
    firstName?: StringWithAggregatesFilter<"PanCardModel"> | string
    middleName?: StringWithAggregatesFilter<"PanCardModel"> | string
    lastName?: StringWithAggregatesFilter<"PanCardModel"> | string
    panCardNo?: StringWithAggregatesFilter<"PanCardModel"> | string
    dateOfBirth?: StringWithAggregatesFilter<"PanCardModel"> | string
    gender?: EnumGenderWithAggregatesFilter<"PanCardModel"> | $Enums.Gender
    isVerified?: BoolWithAggregatesFilter<"PanCardModel"> | boolean
    verifyDate?: DateTimeWithAggregatesFilter<"PanCardModel"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"PanCardModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PanCardModel"> | Date | string
  }

  export type CustomersBankAccountModelWhereInput = {
    AND?: CustomersBankAccountModelWhereInput | CustomersBankAccountModelWhereInput[]
    OR?: CustomersBankAccountModelWhereInput[]
    NOT?: CustomersBankAccountModelWhereInput | CustomersBankAccountModelWhereInput[]
    id?: IntFilter<"CustomersBankAccountModel"> | number
    accountHolderName?: StringFilter<"CustomersBankAccountModel"> | string
    bankAccountType?: StringFilter<"CustomersBankAccountModel"> | string
    accountNumber?: StringFilter<"CustomersBankAccountModel"> | string
    ifscCode?: StringFilter<"CustomersBankAccountModel"> | string
    bankName?: StringFilter<"CustomersBankAccountModel"> | string
    branch?: StringFilter<"CustomersBankAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersBankAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersBankAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersBankAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
    CustomerProfileDataModel?: XOR<CustomerProfileDataModelNullableScalarRelationFilter, CustomerProfileDataModelWhereInput> | null
  }

  export type CustomersBankAccountModelOrderByWithRelationInput = {
    id?: SortOrder
    accountHolderName?: SortOrder
    bankAccountType?: SortOrder
    accountNumber?: SortOrder
    ifscCode?: SortOrder
    bankName?: SortOrder
    branch?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByWithRelationInput
  }

  export type CustomersBankAccountModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomersBankAccountModelWhereInput | CustomersBankAccountModelWhereInput[]
    OR?: CustomersBankAccountModelWhereInput[]
    NOT?: CustomersBankAccountModelWhereInput | CustomersBankAccountModelWhereInput[]
    accountHolderName?: StringFilter<"CustomersBankAccountModel"> | string
    bankAccountType?: StringFilter<"CustomersBankAccountModel"> | string
    accountNumber?: StringFilter<"CustomersBankAccountModel"> | string
    ifscCode?: StringFilter<"CustomersBankAccountModel"> | string
    bankName?: StringFilter<"CustomersBankAccountModel"> | string
    branch?: StringFilter<"CustomersBankAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersBankAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersBankAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersBankAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
    CustomerProfileDataModel?: XOR<CustomerProfileDataModelNullableScalarRelationFilter, CustomerProfileDataModelWhereInput> | null
  }, "id">

  export type CustomersBankAccountModelOrderByWithAggregationInput = {
    id?: SortOrder
    accountHolderName?: SortOrder
    bankAccountType?: SortOrder
    accountNumber?: SortOrder
    ifscCode?: SortOrder
    bankName?: SortOrder
    branch?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomersBankAccountModelCountOrderByAggregateInput
    _avg?: CustomersBankAccountModelAvgOrderByAggregateInput
    _max?: CustomersBankAccountModelMaxOrderByAggregateInput
    _min?: CustomersBankAccountModelMinOrderByAggregateInput
    _sum?: CustomersBankAccountModelSumOrderByAggregateInput
  }

  export type CustomersBankAccountModelScalarWhereWithAggregatesInput = {
    AND?: CustomersBankAccountModelScalarWhereWithAggregatesInput | CustomersBankAccountModelScalarWhereWithAggregatesInput[]
    OR?: CustomersBankAccountModelScalarWhereWithAggregatesInput[]
    NOT?: CustomersBankAccountModelScalarWhereWithAggregatesInput | CustomersBankAccountModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomersBankAccountModel"> | number
    accountHolderName?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    bankAccountType?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    accountNumber?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    ifscCode?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    bankName?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    branch?: StringWithAggregatesFilter<"CustomersBankAccountModel"> | string
    isPrimary?: BoolWithAggregatesFilter<"CustomersBankAccountModel"> | boolean
    isVerified?: BoolWithAggregatesFilter<"CustomersBankAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableWithAggregatesFilter<"CustomersBankAccountModel"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"CustomersBankAccountModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomersBankAccountModel"> | Date | string
  }

  export type CustomersDematAccountModelWhereInput = {
    AND?: CustomersDematAccountModelWhereInput | CustomersDematAccountModelWhereInput[]
    OR?: CustomersDematAccountModelWhereInput[]
    NOT?: CustomersDematAccountModelWhereInput | CustomersDematAccountModelWhereInput[]
    id?: IntFilter<"CustomersDematAccountModel"> | number
    depositoryName?: EnumDepositoryNameFilter<"CustomersDematAccountModel"> | $Enums.DepositoryName
    dpId?: StringFilter<"CustomersDematAccountModel"> | string
    clientId?: StringFilter<"CustomersDematAccountModel"> | string
    accountType?: EnumDematAccountTypeFilter<"CustomersDematAccountModel"> | $Enums.DematAccountType
    depositoryParticipantName?: StringFilter<"CustomersDematAccountModel"> | string
    primaryPanNumber?: StringFilter<"CustomersDematAccountModel"> | string
    sndPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    trdPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    accountHolderName?: StringFilter<"CustomersDematAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersDematAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersDematAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersDematAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
    CustomerProfileDataModel?: XOR<CustomerProfileDataModelNullableScalarRelationFilter, CustomerProfileDataModelWhereInput> | null
  }

  export type CustomersDematAccountModelOrderByWithRelationInput = {
    id?: SortOrder
    depositoryName?: SortOrder
    dpId?: SortOrder
    clientId?: SortOrder
    accountType?: SortOrder
    depositoryParticipantName?: SortOrder
    primaryPanNumber?: SortOrder
    sndPanNumber?: SortOrderInput | SortOrder
    trdPanNumber?: SortOrderInput | SortOrder
    accountHolderName?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    CustomerProfileDataModel?: CustomerProfileDataModelOrderByWithRelationInput
  }

  export type CustomersDematAccountModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomersDematAccountModelWhereInput | CustomersDematAccountModelWhereInput[]
    OR?: CustomersDematAccountModelWhereInput[]
    NOT?: CustomersDematAccountModelWhereInput | CustomersDematAccountModelWhereInput[]
    depositoryName?: EnumDepositoryNameFilter<"CustomersDematAccountModel"> | $Enums.DepositoryName
    dpId?: StringFilter<"CustomersDematAccountModel"> | string
    clientId?: StringFilter<"CustomersDematAccountModel"> | string
    accountType?: EnumDematAccountTypeFilter<"CustomersDematAccountModel"> | $Enums.DematAccountType
    depositoryParticipantName?: StringFilter<"CustomersDematAccountModel"> | string
    primaryPanNumber?: StringFilter<"CustomersDematAccountModel"> | string
    sndPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    trdPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    accountHolderName?: StringFilter<"CustomersDematAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersDematAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersDematAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersDematAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
    CustomerProfileDataModel?: XOR<CustomerProfileDataModelNullableScalarRelationFilter, CustomerProfileDataModelWhereInput> | null
  }, "id">

  export type CustomersDematAccountModelOrderByWithAggregationInput = {
    id?: SortOrder
    depositoryName?: SortOrder
    dpId?: SortOrder
    clientId?: SortOrder
    accountType?: SortOrder
    depositoryParticipantName?: SortOrder
    primaryPanNumber?: SortOrder
    sndPanNumber?: SortOrderInput | SortOrder
    trdPanNumber?: SortOrderInput | SortOrder
    accountHolderName?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomersDematAccountModelCountOrderByAggregateInput
    _avg?: CustomersDematAccountModelAvgOrderByAggregateInput
    _max?: CustomersDematAccountModelMaxOrderByAggregateInput
    _min?: CustomersDematAccountModelMinOrderByAggregateInput
    _sum?: CustomersDematAccountModelSumOrderByAggregateInput
  }

  export type CustomersDematAccountModelScalarWhereWithAggregatesInput = {
    AND?: CustomersDematAccountModelScalarWhereWithAggregatesInput | CustomersDematAccountModelScalarWhereWithAggregatesInput[]
    OR?: CustomersDematAccountModelScalarWhereWithAggregatesInput[]
    NOT?: CustomersDematAccountModelScalarWhereWithAggregatesInput | CustomersDematAccountModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomersDematAccountModel"> | number
    depositoryName?: EnumDepositoryNameWithAggregatesFilter<"CustomersDematAccountModel"> | $Enums.DepositoryName
    dpId?: StringWithAggregatesFilter<"CustomersDematAccountModel"> | string
    clientId?: StringWithAggregatesFilter<"CustomersDematAccountModel"> | string
    accountType?: EnumDematAccountTypeWithAggregatesFilter<"CustomersDematAccountModel"> | $Enums.DematAccountType
    depositoryParticipantName?: StringWithAggregatesFilter<"CustomersDematAccountModel"> | string
    primaryPanNumber?: StringWithAggregatesFilter<"CustomersDematAccountModel"> | string
    sndPanNumber?: StringNullableWithAggregatesFilter<"CustomersDematAccountModel"> | string | null
    trdPanNumber?: StringNullableWithAggregatesFilter<"CustomersDematAccountModel"> | string | null
    accountHolderName?: StringWithAggregatesFilter<"CustomersDematAccountModel"> | string
    isPrimary?: BoolWithAggregatesFilter<"CustomersDematAccountModel"> | boolean
    isVerified?: BoolWithAggregatesFilter<"CustomersDematAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableWithAggregatesFilter<"CustomersDematAccountModel"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"CustomersDematAccountModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomersDematAccountModel"> | Date | string
  }

  export type CustomersRiskProfileModelWhereInput = {
    AND?: CustomersRiskProfileModelWhereInput | CustomersRiskProfileModelWhereInput[]
    OR?: CustomersRiskProfileModelWhereInput[]
    NOT?: CustomersRiskProfileModelWhereInput | CustomersRiskProfileModelWhereInput[]
    id?: IntFilter<"CustomersRiskProfileModel"> | number
    createdAt?: DateTimeFilter<"CustomersRiskProfileModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersRiskProfileModel"> | Date | string
  }

  export type CustomersRiskProfileModelOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersRiskProfileModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CustomersRiskProfileModelWhereInput | CustomersRiskProfileModelWhereInput[]
    OR?: CustomersRiskProfileModelWhereInput[]
    NOT?: CustomersRiskProfileModelWhereInput | CustomersRiskProfileModelWhereInput[]
    createdAt?: DateTimeFilter<"CustomersRiskProfileModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersRiskProfileModel"> | Date | string
  }, "id">

  export type CustomersRiskProfileModelOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustomersRiskProfileModelCountOrderByAggregateInput
    _avg?: CustomersRiskProfileModelAvgOrderByAggregateInput
    _max?: CustomersRiskProfileModelMaxOrderByAggregateInput
    _min?: CustomersRiskProfileModelMinOrderByAggregateInput
    _sum?: CustomersRiskProfileModelSumOrderByAggregateInput
  }

  export type CustomersRiskProfileModelScalarWhereWithAggregatesInput = {
    AND?: CustomersRiskProfileModelScalarWhereWithAggregatesInput | CustomersRiskProfileModelScalarWhereWithAggregatesInput[]
    OR?: CustomersRiskProfileModelScalarWhereWithAggregatesInput[]
    NOT?: CustomersRiskProfileModelScalarWhereWithAggregatesInput | CustomersRiskProfileModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CustomersRiskProfileModel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CustomersRiskProfileModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustomersRiskProfileModel"> | Date | string
  }

  export type AddressModelWhereInput = {
    AND?: AddressModelWhereInput | AddressModelWhereInput[]
    OR?: AddressModelWhereInput[]
    NOT?: AddressModelWhereInput | AddressModelWhereInput[]
    id?: IntFilter<"AddressModel"> | number
    line1?: StringFilter<"AddressModel"> | string
    line2?: StringNullableFilter<"AddressModel"> | string | null
    line3?: StringNullableFilter<"AddressModel"> | string | null
    postOffice?: StringFilter<"AddressModel"> | string
    cityOrDistrict?: StringFilter<"AddressModel"> | string
    state?: StringFilter<"AddressModel"> | string
    pinCode?: StringFilter<"AddressModel"> | string
    country?: StringFilter<"AddressModel"> | string
    fullAddress?: StringFilter<"AddressModel"> | string
    createdAt?: DateTimeFilter<"AddressModel"> | Date | string
    updatedAt?: DateTimeFilter<"AddressModel"> | Date | string
    currentAddressOf?: CustomerProfileDataModelListRelationFilter
    permanentAddressOf?: CustomerProfileDataModelListRelationFilter
  }

  export type AddressModelOrderByWithRelationInput = {
    id?: SortOrder
    line1?: SortOrder
    line2?: SortOrderInput | SortOrder
    line3?: SortOrderInput | SortOrder
    postOffice?: SortOrder
    cityOrDistrict?: SortOrder
    state?: SortOrder
    pinCode?: SortOrder
    country?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    currentAddressOf?: CustomerProfileDataModelOrderByRelationAggregateInput
    permanentAddressOf?: CustomerProfileDataModelOrderByRelationAggregateInput
  }

  export type AddressModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AddressModelWhereInput | AddressModelWhereInput[]
    OR?: AddressModelWhereInput[]
    NOT?: AddressModelWhereInput | AddressModelWhereInput[]
    line1?: StringFilter<"AddressModel"> | string
    line2?: StringNullableFilter<"AddressModel"> | string | null
    line3?: StringNullableFilter<"AddressModel"> | string | null
    postOffice?: StringFilter<"AddressModel"> | string
    cityOrDistrict?: StringFilter<"AddressModel"> | string
    state?: StringFilter<"AddressModel"> | string
    pinCode?: StringFilter<"AddressModel"> | string
    country?: StringFilter<"AddressModel"> | string
    fullAddress?: StringFilter<"AddressModel"> | string
    createdAt?: DateTimeFilter<"AddressModel"> | Date | string
    updatedAt?: DateTimeFilter<"AddressModel"> | Date | string
    currentAddressOf?: CustomerProfileDataModelListRelationFilter
    permanentAddressOf?: CustomerProfileDataModelListRelationFilter
  }, "id">

  export type AddressModelOrderByWithAggregationInput = {
    id?: SortOrder
    line1?: SortOrder
    line2?: SortOrderInput | SortOrder
    line3?: SortOrderInput | SortOrder
    postOffice?: SortOrder
    cityOrDistrict?: SortOrder
    state?: SortOrder
    pinCode?: SortOrder
    country?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AddressModelCountOrderByAggregateInput
    _avg?: AddressModelAvgOrderByAggregateInput
    _max?: AddressModelMaxOrderByAggregateInput
    _min?: AddressModelMinOrderByAggregateInput
    _sum?: AddressModelSumOrderByAggregateInput
  }

  export type AddressModelScalarWhereWithAggregatesInput = {
    AND?: AddressModelScalarWhereWithAggregatesInput | AddressModelScalarWhereWithAggregatesInput[]
    OR?: AddressModelScalarWhereWithAggregatesInput[]
    NOT?: AddressModelScalarWhereWithAggregatesInput | AddressModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AddressModel"> | number
    line1?: StringWithAggregatesFilter<"AddressModel"> | string
    line2?: StringNullableWithAggregatesFilter<"AddressModel"> | string | null
    line3?: StringNullableWithAggregatesFilter<"AddressModel"> | string | null
    postOffice?: StringWithAggregatesFilter<"AddressModel"> | string
    cityOrDistrict?: StringWithAggregatesFilter<"AddressModel"> | string
    state?: StringWithAggregatesFilter<"AddressModel"> | string
    pinCode?: StringWithAggregatesFilter<"AddressModel"> | string
    country?: StringWithAggregatesFilter<"AddressModel"> | string
    fullAddress?: StringWithAggregatesFilter<"AddressModel"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AddressModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AddressModel"> | Date | string
  }

  export type LeadsModelWhereInput = {
    AND?: LeadsModelWhereInput | LeadsModelWhereInput[]
    OR?: LeadsModelWhereInput[]
    NOT?: LeadsModelWhereInput | LeadsModelWhereInput[]
    id?: IntFilter<"LeadsModel"> | number
    fullName?: StringFilter<"LeadsModel"> | string
    emailAddress?: StringFilter<"LeadsModel"> | string
    phoneNo?: StringFilter<"LeadsModel"> | string
    companyName?: StringFilter<"LeadsModel"> | string
    leadSource?: EnumLeadSourceFilter<"LeadsModel"> | $Enums.LeadSource
    bondType?: EnumBondTypeFilter<"LeadsModel"> | $Enums.BondType
    status?: EnumLeadStatusFilter<"LeadsModel"> | $Enums.LeadStatus
    exInvestmentAmount?: IntNullableFilter<"LeadsModel"> | number | null
    note?: StringNullableFilter<"LeadsModel"> | string | null
    createdBy?: IntFilter<"LeadsModel"> | number
    createdAt?: DateTimeFilter<"LeadsModel"> | Date | string
    updatedAt?: DateTimeFilter<"LeadsModel"> | Date | string
  }

  export type LeadsModelOrderByWithRelationInput = {
    id?: SortOrder
    fullName?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    companyName?: SortOrder
    leadSource?: SortOrder
    bondType?: SortOrder
    status?: SortOrder
    exInvestmentAmount?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadsModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: LeadsModelWhereInput | LeadsModelWhereInput[]
    OR?: LeadsModelWhereInput[]
    NOT?: LeadsModelWhereInput | LeadsModelWhereInput[]
    fullName?: StringFilter<"LeadsModel"> | string
    emailAddress?: StringFilter<"LeadsModel"> | string
    phoneNo?: StringFilter<"LeadsModel"> | string
    companyName?: StringFilter<"LeadsModel"> | string
    leadSource?: EnumLeadSourceFilter<"LeadsModel"> | $Enums.LeadSource
    bondType?: EnumBondTypeFilter<"LeadsModel"> | $Enums.BondType
    status?: EnumLeadStatusFilter<"LeadsModel"> | $Enums.LeadStatus
    exInvestmentAmount?: IntNullableFilter<"LeadsModel"> | number | null
    note?: StringNullableFilter<"LeadsModel"> | string | null
    createdBy?: IntFilter<"LeadsModel"> | number
    createdAt?: DateTimeFilter<"LeadsModel"> | Date | string
    updatedAt?: DateTimeFilter<"LeadsModel"> | Date | string
  }, "id">

  export type LeadsModelOrderByWithAggregationInput = {
    id?: SortOrder
    fullName?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    companyName?: SortOrder
    leadSource?: SortOrder
    bondType?: SortOrder
    status?: SortOrder
    exInvestmentAmount?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LeadsModelCountOrderByAggregateInput
    _avg?: LeadsModelAvgOrderByAggregateInput
    _max?: LeadsModelMaxOrderByAggregateInput
    _min?: LeadsModelMinOrderByAggregateInput
    _sum?: LeadsModelSumOrderByAggregateInput
  }

  export type LeadsModelScalarWhereWithAggregatesInput = {
    AND?: LeadsModelScalarWhereWithAggregatesInput | LeadsModelScalarWhereWithAggregatesInput[]
    OR?: LeadsModelScalarWhereWithAggregatesInput[]
    NOT?: LeadsModelScalarWhereWithAggregatesInput | LeadsModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"LeadsModel"> | number
    fullName?: StringWithAggregatesFilter<"LeadsModel"> | string
    emailAddress?: StringWithAggregatesFilter<"LeadsModel"> | string
    phoneNo?: StringWithAggregatesFilter<"LeadsModel"> | string
    companyName?: StringWithAggregatesFilter<"LeadsModel"> | string
    leadSource?: EnumLeadSourceWithAggregatesFilter<"LeadsModel"> | $Enums.LeadSource
    bondType?: EnumBondTypeWithAggregatesFilter<"LeadsModel"> | $Enums.BondType
    status?: EnumLeadStatusWithAggregatesFilter<"LeadsModel"> | $Enums.LeadStatus
    exInvestmentAmount?: IntNullableWithAggregatesFilter<"LeadsModel"> | number | null
    note?: StringNullableWithAggregatesFilter<"LeadsModel"> | string | null
    createdBy?: IntWithAggregatesFilter<"LeadsModel"> | number
    createdAt?: DateTimeWithAggregatesFilter<"LeadsModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LeadsModel"> | Date | string
  }

  export type LeadFollowUpNotesModelWhereInput = {
    AND?: LeadFollowUpNotesModelWhereInput | LeadFollowUpNotesModelWhereInput[]
    OR?: LeadFollowUpNotesModelWhereInput[]
    NOT?: LeadFollowUpNotesModelWhereInput | LeadFollowUpNotesModelWhereInput[]
    id?: IntFilter<"LeadFollowUpNotesModel"> | number
    leadId?: IntFilter<"LeadFollowUpNotesModel"> | number
    createdByName?: StringFilter<"LeadFollowUpNotesModel"> | string
    createdByID?: IntFilter<"LeadFollowUpNotesModel"> | number
    text?: StringFilter<"LeadFollowUpNotesModel"> | string
    nextDate?: DateTimeNullableFilter<"LeadFollowUpNotesModel"> | Date | string | null
    createdAt?: DateTimeFilter<"LeadFollowUpNotesModel"> | Date | string
    updatedAt?: DateTimeFilter<"LeadFollowUpNotesModel"> | Date | string
  }

  export type LeadFollowUpNotesModelOrderByWithRelationInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByName?: SortOrder
    createdByID?: SortOrder
    text?: SortOrder
    nextDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadFollowUpNotesModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: LeadFollowUpNotesModelWhereInput | LeadFollowUpNotesModelWhereInput[]
    OR?: LeadFollowUpNotesModelWhereInput[]
    NOT?: LeadFollowUpNotesModelWhereInput | LeadFollowUpNotesModelWhereInput[]
    leadId?: IntFilter<"LeadFollowUpNotesModel"> | number
    createdByName?: StringFilter<"LeadFollowUpNotesModel"> | string
    createdByID?: IntFilter<"LeadFollowUpNotesModel"> | number
    text?: StringFilter<"LeadFollowUpNotesModel"> | string
    nextDate?: DateTimeNullableFilter<"LeadFollowUpNotesModel"> | Date | string | null
    createdAt?: DateTimeFilter<"LeadFollowUpNotesModel"> | Date | string
    updatedAt?: DateTimeFilter<"LeadFollowUpNotesModel"> | Date | string
  }, "id">

  export type LeadFollowUpNotesModelOrderByWithAggregationInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByName?: SortOrder
    createdByID?: SortOrder
    text?: SortOrder
    nextDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LeadFollowUpNotesModelCountOrderByAggregateInput
    _avg?: LeadFollowUpNotesModelAvgOrderByAggregateInput
    _max?: LeadFollowUpNotesModelMaxOrderByAggregateInput
    _min?: LeadFollowUpNotesModelMinOrderByAggregateInput
    _sum?: LeadFollowUpNotesModelSumOrderByAggregateInput
  }

  export type LeadFollowUpNotesModelScalarWhereWithAggregatesInput = {
    AND?: LeadFollowUpNotesModelScalarWhereWithAggregatesInput | LeadFollowUpNotesModelScalarWhereWithAggregatesInput[]
    OR?: LeadFollowUpNotesModelScalarWhereWithAggregatesInput[]
    NOT?: LeadFollowUpNotesModelScalarWhereWithAggregatesInput | LeadFollowUpNotesModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"LeadFollowUpNotesModel"> | number
    leadId?: IntWithAggregatesFilter<"LeadFollowUpNotesModel"> | number
    createdByName?: StringWithAggregatesFilter<"LeadFollowUpNotesModel"> | string
    createdByID?: IntWithAggregatesFilter<"LeadFollowUpNotesModel"> | number
    text?: StringWithAggregatesFilter<"LeadFollowUpNotesModel"> | string
    nextDate?: DateTimeNullableWithAggregatesFilter<"LeadFollowUpNotesModel"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LeadFollowUpNotesModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LeadFollowUpNotesModel"> | Date | string
  }

  export type CRMUserDataModelCreateInput = {
    name: string
    email: string
    phoneNo: string
    avatar?: string | null
    lastLogin?: Date | string | null
    role?: $Enums.CrmUserROLE
    accountStatus?: $Enums.AccountStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
  }

  export type CRMUserDataModelUncheckedCreateInput = {
    id?: number
    name: string
    email: string
    phoneNo: string
    avatar?: string | null
    lastLogin?: Date | string | null
    role?: $Enums.CrmUserROLE
    accountStatus?: $Enums.AccountStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
  }

  export type CRMUserDataModelUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumCrmUserROLEFieldUpdateOperationsInput | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CRMUserDataModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumCrmUserROLEFieldUpdateOperationsInput | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CRMUserDataModelCreateManyInput = {
    id?: number
    name: string
    email: string
    phoneNo: string
    avatar?: string | null
    lastLogin?: Date | string | null
    role?: $Enums.CrmUserROLE
    accountStatus?: $Enums.AccountStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
  }

  export type CRMUserDataModelUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumCrmUserROLEFieldUpdateOperationsInput | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CRMUserDataModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumCrmUserROLEFieldUpdateOperationsInput | $Enums.CrmUserROLE
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomersAuthDataModelCreateInput = {
    password?: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus?: $Enums.AccountStatus
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedManyWithoutUtilityInput
  }

  export type CustomersAuthDataModelUncheckedCreateInput = {
    id?: number
    password?: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus?: $Enums.AccountStatus
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutUtilityInput
  }

  export type CustomersAuthDataModelUpdateInput = {
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateManyWithoutUtilityNestedInput
  }

  export type CustomersAuthDataModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedUpdateManyWithoutUtilityNestedInput
  }

  export type CustomersAuthDataModelCreateManyInput = {
    id?: number
    password?: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus?: $Enums.AccountStatus
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersAuthDataModelUpdateManyMutationInput = {
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersAuthDataModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerProfileDataModelCreateInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelUpdateInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelCreateManyInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateManyMutationInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerProfileDataModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerPersonalInfoModelCreateInput = {
    SignatureUrl?: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName?: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedManyWithoutPersonalInformationInput
  }

  export type CustomerPersonalInfoModelUncheckedCreateInput = {
    id?: number
    SignatureUrl?: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName?: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutPersonalInformationInput
  }

  export type CustomerPersonalInfoModelUpdateInput = {
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateManyWithoutPersonalInformationNestedInput
  }

  export type CustomerPersonalInfoModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedUpdateManyWithoutPersonalInformationNestedInput
  }

  export type CustomerPersonalInfoModelCreateManyInput = {
    id?: number
    SignatureUrl?: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName?: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerPersonalInfoModelUpdateManyMutationInput = {
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerPersonalInfoModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AADHAARCardModelCreateInput = {
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedManyWithoutAadhaarCardInput
  }

  export type AADHAARCardModelUncheckedCreateInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutAadhaarCardInput
  }

  export type AADHAARCardModelUpdateInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateManyWithoutAadhaarCardNestedInput
  }

  export type AADHAARCardModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedUpdateManyWithoutAadhaarCardNestedInput
  }

  export type AADHAARCardModelCreateManyInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AADHAARCardModelUpdateManyMutationInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AADHAARCardModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PanCardModelCreateInput = {
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedManyWithoutPanCardInput
  }

  export type PanCardModelUncheckedCreateInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutPanCardInput
  }

  export type PanCardModelUpdateInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateManyWithoutPanCardNestedInput
  }

  export type PanCardModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUncheckedUpdateManyWithoutPanCardNestedInput
  }

  export type PanCardModelCreateManyInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PanCardModelUpdateManyMutationInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PanCardModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelCreateInput = {
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedOneWithoutBankAccountsInput
  }

  export type CustomersBankAccountModelUncheckedCreateInput = {
    id?: number
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersBankAccountModelUpdateInput = {
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateOneWithoutBankAccountsNestedInput
  }

  export type CustomersBankAccountModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    customerProfileDataModelId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelCreateManyInput = {
    id?: number
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersBankAccountModelUpdateManyMutationInput = {
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    customerProfileDataModelId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelCreateInput = {
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelCreateNestedOneWithoutDematAccountsInput
  }

  export type CustomersDematAccountModelUncheckedCreateInput = {
    id?: number
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersDematAccountModelUpdateInput = {
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    CustomerProfileDataModel?: CustomerProfileDataModelUpdateOneWithoutDematAccountsNestedInput
  }

  export type CustomersDematAccountModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    customerProfileDataModelId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelCreateManyInput = {
    id?: number
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    customerProfileDataModelId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersDematAccountModelUpdateManyMutationInput = {
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    customerProfileDataModelId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersRiskProfileModelCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersRiskProfileModelUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersRiskProfileModelUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersRiskProfileModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersRiskProfileModelCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersRiskProfileModelUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersRiskProfileModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressModelCreateInput = {
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentAddressOf?: CustomerProfileDataModelCreateNestedManyWithoutCurrentAddressInput
    permanentAddressOf?: CustomerProfileDataModelCreateNestedManyWithoutPermanentAddressInput
  }

  export type AddressModelUncheckedCreateInput = {
    id?: number
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentAddressOf?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutCurrentAddressInput
    permanentAddressOf?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutPermanentAddressInput
  }

  export type AddressModelUpdateInput = {
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentAddressOf?: CustomerProfileDataModelUpdateManyWithoutCurrentAddressNestedInput
    permanentAddressOf?: CustomerProfileDataModelUpdateManyWithoutPermanentAddressNestedInput
  }

  export type AddressModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentAddressOf?: CustomerProfileDataModelUncheckedUpdateManyWithoutCurrentAddressNestedInput
    permanentAddressOf?: CustomerProfileDataModelUncheckedUpdateManyWithoutPermanentAddressNestedInput
  }

  export type AddressModelCreateManyInput = {
    id?: number
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AddressModelUpdateManyMutationInput = {
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AddressModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadsModelCreateInput = {
    fullName: string
    emailAddress: string
    phoneNo: string
    companyName: string
    leadSource: $Enums.LeadSource
    bondType: $Enums.BondType
    status: $Enums.LeadStatus
    exInvestmentAmount?: number | null
    note?: string | null
    createdBy: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadsModelUncheckedCreateInput = {
    id?: number
    fullName: string
    emailAddress: string
    phoneNo: string
    companyName: string
    leadSource: $Enums.LeadSource
    bondType: $Enums.BondType
    status: $Enums.LeadStatus
    exInvestmentAmount?: number | null
    note?: string | null
    createdBy: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadsModelUpdateInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    leadSource?: EnumLeadSourceFieldUpdateOperationsInput | $Enums.LeadSource
    bondType?: EnumBondTypeFieldUpdateOperationsInput | $Enums.BondType
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    exInvestmentAmount?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadsModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    leadSource?: EnumLeadSourceFieldUpdateOperationsInput | $Enums.LeadSource
    bondType?: EnumBondTypeFieldUpdateOperationsInput | $Enums.BondType
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    exInvestmentAmount?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadsModelCreateManyInput = {
    id?: number
    fullName: string
    emailAddress: string
    phoneNo: string
    companyName: string
    leadSource: $Enums.LeadSource
    bondType: $Enums.BondType
    status: $Enums.LeadStatus
    exInvestmentAmount?: number | null
    note?: string | null
    createdBy: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadsModelUpdateManyMutationInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    leadSource?: EnumLeadSourceFieldUpdateOperationsInput | $Enums.LeadSource
    bondType?: EnumBondTypeFieldUpdateOperationsInput | $Enums.BondType
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    exInvestmentAmount?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadsModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    leadSource?: EnumLeadSourceFieldUpdateOperationsInput | $Enums.LeadSource
    bondType?: EnumBondTypeFieldUpdateOperationsInput | $Enums.BondType
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    exInvestmentAmount?: NullableIntFieldUpdateOperationsInput | number | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadFollowUpNotesModelCreateInput = {
    leadId: number
    createdByName: string
    createdByID: number
    text: string
    nextDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadFollowUpNotesModelUncheckedCreateInput = {
    id?: number
    leadId: number
    createdByName: string
    createdByID: number
    text: string
    nextDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadFollowUpNotesModelUpdateInput = {
    leadId?: IntFieldUpdateOperationsInput | number
    createdByName?: StringFieldUpdateOperationsInput | string
    createdByID?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    nextDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadFollowUpNotesModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    leadId?: IntFieldUpdateOperationsInput | number
    createdByName?: StringFieldUpdateOperationsInput | string
    createdByID?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    nextDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadFollowUpNotesModelCreateManyInput = {
    id?: number
    leadId: number
    createdByName: string
    createdByID: number
    text: string
    nextDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LeadFollowUpNotesModelUpdateManyMutationInput = {
    leadId?: IntFieldUpdateOperationsInput | number
    createdByName?: StringFieldUpdateOperationsInput | string
    createdByID?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    nextDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadFollowUpNotesModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    leadId?: IntFieldUpdateOperationsInput | number
    createdByName?: StringFieldUpdateOperationsInput | string
    createdByID?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    nextDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumCrmUserROLEFilter<$PrismaModel = never> = {
    equals?: $Enums.CrmUserROLE | EnumCrmUserROLEFieldRefInput<$PrismaModel>
    in?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumCrmUserROLEFilter<$PrismaModel> | $Enums.CrmUserROLE
  }

  export type EnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CRMUserDataModelCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phoneNo?: SortOrder
    avatar?: SortOrder
    lastLogin?: SortOrder
    role?: SortOrder
    accountStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type CRMUserDataModelAvgOrderByAggregateInput = {
    id?: SortOrder
    createdBy?: SortOrder
  }

  export type CRMUserDataModelMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phoneNo?: SortOrder
    avatar?: SortOrder
    lastLogin?: SortOrder
    role?: SortOrder
    accountStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type CRMUserDataModelMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phoneNo?: SortOrder
    avatar?: SortOrder
    lastLogin?: SortOrder
    role?: SortOrder
    accountStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type CRMUserDataModelSumOrderByAggregateInput = {
    id?: SortOrder
    createdBy?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumCrmUserROLEWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CrmUserROLE | EnumCrmUserROLEFieldRefInput<$PrismaModel>
    in?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumCrmUserROLEWithAggregatesFilter<$PrismaModel> | $Enums.CrmUserROLE
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCrmUserROLEFilter<$PrismaModel>
    _max?: NestedEnumCrmUserROLEFilter<$PrismaModel>
  }

  export type EnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumSIGNIN_WITHFilter<$PrismaModel = never> = {
    equals?: $Enums.SIGNIN_WITH | EnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    in?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    notIn?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    not?: NestedEnumSIGNIN_WITHFilter<$PrismaModel> | $Enums.SIGNIN_WITH
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CustomerProfileDataModelListRelationFilter = {
    every?: CustomerProfileDataModelWhereInput
    some?: CustomerProfileDataModelWhereInput
    none?: CustomerProfileDataModelWhereInput
  }

  export type CustomerProfileDataModelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomersAuthDataModelCountOrderByAggregateInput = {
    id?: SortOrder
    password?: SortOrder
    signinWith?: SortOrder
    accountStatus?: SortOrder
    isPhoneVerified?: SortOrder
    isEmailVerified?: SortOrder
    whatsAppNotificationAllow?: SortOrder
    termsAccepted?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersAuthDataModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomersAuthDataModelMaxOrderByAggregateInput = {
    id?: SortOrder
    password?: SortOrder
    signinWith?: SortOrder
    accountStatus?: SortOrder
    isPhoneVerified?: SortOrder
    isEmailVerified?: SortOrder
    whatsAppNotificationAllow?: SortOrder
    termsAccepted?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersAuthDataModelMinOrderByAggregateInput = {
    id?: SortOrder
    password?: SortOrder
    signinWith?: SortOrder
    accountStatus?: SortOrder
    isPhoneVerified?: SortOrder
    isEmailVerified?: SortOrder
    whatsAppNotificationAllow?: SortOrder
    termsAccepted?: SortOrder
    lastLogin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersAuthDataModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumSIGNIN_WITHWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SIGNIN_WITH | EnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    in?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    notIn?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    not?: NestedEnumSIGNIN_WITHWithAggregatesFilter<$PrismaModel> | $Enums.SIGNIN_WITH
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSIGNIN_WITHFilter<$PrismaModel>
    _max?: NestedEnumSIGNIN_WITHFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumGenderFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel>
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    not?: NestedEnumGenderFilter<$PrismaModel> | $Enums.Gender
  }

  export type EnumUserAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserAccountType | EnumUserAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserAccountTypeFilter<$PrismaModel> | $Enums.UserAccountType
  }

  export type EnumKYCStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.KYCStatus | EnumKYCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKYCStatusFilter<$PrismaModel> | $Enums.KYCStatus
  }

  export type CustomersAuthDataModelScalarRelationFilter = {
    is?: CustomersAuthDataModelWhereInput
    isNot?: CustomersAuthDataModelWhereInput
  }

  export type AADHAARCardModelNullableScalarRelationFilter = {
    is?: AADHAARCardModelWhereInput | null
    isNot?: AADHAARCardModelWhereInput | null
  }

  export type PanCardModelNullableScalarRelationFilter = {
    is?: PanCardModelWhereInput | null
    isNot?: PanCardModelWhereInput | null
  }

  export type CustomerPersonalInfoModelNullableScalarRelationFilter = {
    is?: CustomerPersonalInfoModelWhereInput | null
    isNot?: CustomerPersonalInfoModelWhereInput | null
  }

  export type CustomersBankAccountModelListRelationFilter = {
    every?: CustomersBankAccountModelWhereInput
    some?: CustomersBankAccountModelWhereInput
    none?: CustomersBankAccountModelWhereInput
  }

  export type CustomersDematAccountModelListRelationFilter = {
    every?: CustomersDematAccountModelWhereInput
    some?: CustomersDematAccountModelWhereInput
    none?: CustomersDematAccountModelWhereInput
  }

  export type AddressModelNullableScalarRelationFilter = {
    is?: AddressModelWhereInput | null
    isNot?: AddressModelWhereInput | null
  }

  export type CustomersBankAccountModelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomersDematAccountModelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerProfileDataModelCountOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    gender?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    whatsAppNo?: SortOrder
    avatar?: SortOrder
    userType?: SortOrder
    kycStatus?: SortOrder
    VerifiedBy?: SortOrder
    customersAuthDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    aADHAARCardModelId?: SortOrder
    panCardModelId?: SortOrder
    customerPersonalInfoModelId?: SortOrder
    currentAddressModelId?: SortOrder
    permanentAddressModelId?: SortOrder
  }

  export type CustomerProfileDataModelAvgOrderByAggregateInput = {
    id?: SortOrder
    VerifiedBy?: SortOrder
    customersAuthDataModelId?: SortOrder
    createdBy?: SortOrder
    aADHAARCardModelId?: SortOrder
    panCardModelId?: SortOrder
    customerPersonalInfoModelId?: SortOrder
    currentAddressModelId?: SortOrder
    permanentAddressModelId?: SortOrder
  }

  export type CustomerProfileDataModelMaxOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    gender?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    whatsAppNo?: SortOrder
    avatar?: SortOrder
    userType?: SortOrder
    kycStatus?: SortOrder
    VerifiedBy?: SortOrder
    customersAuthDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    aADHAARCardModelId?: SortOrder
    panCardModelId?: SortOrder
    customerPersonalInfoModelId?: SortOrder
    currentAddressModelId?: SortOrder
    permanentAddressModelId?: SortOrder
  }

  export type CustomerProfileDataModelMinOrderByAggregateInput = {
    id?: SortOrder
    userName?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    gender?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    whatsAppNo?: SortOrder
    avatar?: SortOrder
    userType?: SortOrder
    kycStatus?: SortOrder
    VerifiedBy?: SortOrder
    customersAuthDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    aADHAARCardModelId?: SortOrder
    panCardModelId?: SortOrder
    customerPersonalInfoModelId?: SortOrder
    currentAddressModelId?: SortOrder
    permanentAddressModelId?: SortOrder
  }

  export type CustomerProfileDataModelSumOrderByAggregateInput = {
    id?: SortOrder
    VerifiedBy?: SortOrder
    customersAuthDataModelId?: SortOrder
    createdBy?: SortOrder
    aADHAARCardModelId?: SortOrder
    panCardModelId?: SortOrder
    customerPersonalInfoModelId?: SortOrder
    currentAddressModelId?: SortOrder
    permanentAddressModelId?: SortOrder
  }

  export type EnumGenderWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel>
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    not?: NestedEnumGenderWithAggregatesFilter<$PrismaModel> | $Enums.Gender
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGenderFilter<$PrismaModel>
    _max?: NestedEnumGenderFilter<$PrismaModel>
  }

  export type EnumUserAccountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserAccountType | EnumUserAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserAccountTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserAccountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserAccountTypeFilter<$PrismaModel>
    _max?: NestedEnumUserAccountTypeFilter<$PrismaModel>
  }

  export type EnumKYCStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KYCStatus | EnumKYCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKYCStatusWithAggregatesFilter<$PrismaModel> | $Enums.KYCStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKYCStatusFilter<$PrismaModel>
    _max?: NestedEnumKYCStatusFilter<$PrismaModel>
  }

  export type CustomerPersonalInfoModelCountOrderByAggregateInput = {
    id?: SortOrder
    SignatureUrl?: SortOrder
    maritalStatus?: SortOrder
    occupationType?: SortOrder
    annualGrossIncome?: SortOrder
    fatherOrSpouseName?: SortOrder
    mothersName?: SortOrder
    nationality?: SortOrder
    maidenName?: SortOrder
    residentialStatus?: SortOrder
    qualification?: SortOrder
    politicallyExposedPerson?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerPersonalInfoModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomerPersonalInfoModelMaxOrderByAggregateInput = {
    id?: SortOrder
    SignatureUrl?: SortOrder
    maritalStatus?: SortOrder
    occupationType?: SortOrder
    annualGrossIncome?: SortOrder
    fatherOrSpouseName?: SortOrder
    mothersName?: SortOrder
    nationality?: SortOrder
    maidenName?: SortOrder
    residentialStatus?: SortOrder
    qualification?: SortOrder
    politicallyExposedPerson?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerPersonalInfoModelMinOrderByAggregateInput = {
    id?: SortOrder
    SignatureUrl?: SortOrder
    maritalStatus?: SortOrder
    occupationType?: SortOrder
    annualGrossIncome?: SortOrder
    fatherOrSpouseName?: SortOrder
    mothersName?: SortOrder
    nationality?: SortOrder
    maidenName?: SortOrder
    residentialStatus?: SortOrder
    qualification?: SortOrder
    politicallyExposedPerson?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomerPersonalInfoModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AADHAARCardModelCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    fatherName?: SortOrder
    aadhaarNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    image?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AADHAARCardModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AADHAARCardModelMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    fatherName?: SortOrder
    aadhaarNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    image?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AADHAARCardModelMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    fatherName?: SortOrder
    aadhaarNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    image?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AADHAARCardModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PanCardModelCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    panCardNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PanCardModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PanCardModelMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    panCardNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PanCardModelMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    middleName?: SortOrder
    lastName?: SortOrder
    panCardNo?: SortOrder
    dateOfBirth?: SortOrder
    gender?: SortOrder
    isVerified?: SortOrder
    verifyDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PanCardModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomerProfileDataModelNullableScalarRelationFilter = {
    is?: CustomerProfileDataModelWhereInput | null
    isNot?: CustomerProfileDataModelWhereInput | null
  }

  export type CustomersBankAccountModelCountOrderByAggregateInput = {
    id?: SortOrder
    accountHolderName?: SortOrder
    bankAccountType?: SortOrder
    accountNumber?: SortOrder
    ifscCode?: SortOrder
    bankName?: SortOrder
    branch?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersBankAccountModelAvgOrderByAggregateInput = {
    id?: SortOrder
    customerProfileDataModelId?: SortOrder
  }

  export type CustomersBankAccountModelMaxOrderByAggregateInput = {
    id?: SortOrder
    accountHolderName?: SortOrder
    bankAccountType?: SortOrder
    accountNumber?: SortOrder
    ifscCode?: SortOrder
    bankName?: SortOrder
    branch?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersBankAccountModelMinOrderByAggregateInput = {
    id?: SortOrder
    accountHolderName?: SortOrder
    bankAccountType?: SortOrder
    accountNumber?: SortOrder
    ifscCode?: SortOrder
    bankName?: SortOrder
    branch?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersBankAccountModelSumOrderByAggregateInput = {
    id?: SortOrder
    customerProfileDataModelId?: SortOrder
  }

  export type EnumDepositoryNameFilter<$PrismaModel = never> = {
    equals?: $Enums.DepositoryName | EnumDepositoryNameFieldRefInput<$PrismaModel>
    in?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    notIn?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    not?: NestedEnumDepositoryNameFilter<$PrismaModel> | $Enums.DepositoryName
  }

  export type EnumDematAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DematAccountType | EnumDematAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDematAccountTypeFilter<$PrismaModel> | $Enums.DematAccountType
  }

  export type CustomersDematAccountModelCountOrderByAggregateInput = {
    id?: SortOrder
    depositoryName?: SortOrder
    dpId?: SortOrder
    clientId?: SortOrder
    accountType?: SortOrder
    depositoryParticipantName?: SortOrder
    primaryPanNumber?: SortOrder
    sndPanNumber?: SortOrder
    trdPanNumber?: SortOrder
    accountHolderName?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersDematAccountModelAvgOrderByAggregateInput = {
    id?: SortOrder
    customerProfileDataModelId?: SortOrder
  }

  export type CustomersDematAccountModelMaxOrderByAggregateInput = {
    id?: SortOrder
    depositoryName?: SortOrder
    dpId?: SortOrder
    clientId?: SortOrder
    accountType?: SortOrder
    depositoryParticipantName?: SortOrder
    primaryPanNumber?: SortOrder
    sndPanNumber?: SortOrder
    trdPanNumber?: SortOrder
    accountHolderName?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersDematAccountModelMinOrderByAggregateInput = {
    id?: SortOrder
    depositoryName?: SortOrder
    dpId?: SortOrder
    clientId?: SortOrder
    accountType?: SortOrder
    depositoryParticipantName?: SortOrder
    primaryPanNumber?: SortOrder
    sndPanNumber?: SortOrder
    trdPanNumber?: SortOrder
    accountHolderName?: SortOrder
    isPrimary?: SortOrder
    isVerified?: SortOrder
    customerProfileDataModelId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersDematAccountModelSumOrderByAggregateInput = {
    id?: SortOrder
    customerProfileDataModelId?: SortOrder
  }

  export type EnumDepositoryNameWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DepositoryName | EnumDepositoryNameFieldRefInput<$PrismaModel>
    in?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    notIn?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    not?: NestedEnumDepositoryNameWithAggregatesFilter<$PrismaModel> | $Enums.DepositoryName
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDepositoryNameFilter<$PrismaModel>
    _max?: NestedEnumDepositoryNameFilter<$PrismaModel>
  }

  export type EnumDematAccountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DematAccountType | EnumDematAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDematAccountTypeWithAggregatesFilter<$PrismaModel> | $Enums.DematAccountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDematAccountTypeFilter<$PrismaModel>
    _max?: NestedEnumDematAccountTypeFilter<$PrismaModel>
  }

  export type CustomersRiskProfileModelCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersRiskProfileModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CustomersRiskProfileModelMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersRiskProfileModelMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustomersRiskProfileModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AddressModelCountOrderByAggregateInput = {
    id?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    line3?: SortOrder
    postOffice?: SortOrder
    cityOrDistrict?: SortOrder
    state?: SortOrder
    pinCode?: SortOrder
    country?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AddressModelMaxOrderByAggregateInput = {
    id?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    line3?: SortOrder
    postOffice?: SortOrder
    cityOrDistrict?: SortOrder
    state?: SortOrder
    pinCode?: SortOrder
    country?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressModelMinOrderByAggregateInput = {
    id?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    line3?: SortOrder
    postOffice?: SortOrder
    cityOrDistrict?: SortOrder
    state?: SortOrder
    pinCode?: SortOrder
    country?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AddressModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumLeadSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadSource | EnumLeadSourceFieldRefInput<$PrismaModel>
    in?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadSourceFilter<$PrismaModel> | $Enums.LeadSource
  }

  export type EnumBondTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BondType | EnumBondTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBondTypeFilter<$PrismaModel> | $Enums.BondType
  }

  export type EnumLeadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusFilter<$PrismaModel> | $Enums.LeadStatus
  }

  export type LeadsModelCountOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    companyName?: SortOrder
    leadSource?: SortOrder
    bondType?: SortOrder
    status?: SortOrder
    exInvestmentAmount?: SortOrder
    note?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadsModelAvgOrderByAggregateInput = {
    id?: SortOrder
    exInvestmentAmount?: SortOrder
    createdBy?: SortOrder
  }

  export type LeadsModelMaxOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    companyName?: SortOrder
    leadSource?: SortOrder
    bondType?: SortOrder
    status?: SortOrder
    exInvestmentAmount?: SortOrder
    note?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadsModelMinOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    emailAddress?: SortOrder
    phoneNo?: SortOrder
    companyName?: SortOrder
    leadSource?: SortOrder
    bondType?: SortOrder
    status?: SortOrder
    exInvestmentAmount?: SortOrder
    note?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadsModelSumOrderByAggregateInput = {
    id?: SortOrder
    exInvestmentAmount?: SortOrder
    createdBy?: SortOrder
  }

  export type EnumLeadSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadSource | EnumLeadSourceFieldRefInput<$PrismaModel>
    in?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadSourceWithAggregatesFilter<$PrismaModel> | $Enums.LeadSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadSourceFilter<$PrismaModel>
    _max?: NestedEnumLeadSourceFilter<$PrismaModel>
  }

  export type EnumBondTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BondType | EnumBondTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBondTypeWithAggregatesFilter<$PrismaModel> | $Enums.BondType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBondTypeFilter<$PrismaModel>
    _max?: NestedEnumBondTypeFilter<$PrismaModel>
  }

  export type EnumLeadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadStatusFilter<$PrismaModel>
    _max?: NestedEnumLeadStatusFilter<$PrismaModel>
  }

  export type LeadFollowUpNotesModelCountOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByName?: SortOrder
    createdByID?: SortOrder
    text?: SortOrder
    nextDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadFollowUpNotesModelAvgOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByID?: SortOrder
  }

  export type LeadFollowUpNotesModelMaxOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByName?: SortOrder
    createdByID?: SortOrder
    text?: SortOrder
    nextDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadFollowUpNotesModelMinOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByName?: SortOrder
    createdByID?: SortOrder
    text?: SortOrder
    nextDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeadFollowUpNotesModelSumOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    createdByID?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumCrmUserROLEFieldUpdateOperationsInput = {
    set?: $Enums.CrmUserROLE
  }

  export type EnumAccountStatusFieldUpdateOperationsInput = {
    set?: $Enums.AccountStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutUtilityInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput> | CustomerProfileDataModelCreateWithoutUtilityInput[] | CustomerProfileDataModelUncheckedCreateWithoutUtilityInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutUtilityInput | CustomerProfileDataModelCreateOrConnectWithoutUtilityInput[]
    createMany?: CustomerProfileDataModelCreateManyUtilityInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutUtilityInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput> | CustomerProfileDataModelCreateWithoutUtilityInput[] | CustomerProfileDataModelUncheckedCreateWithoutUtilityInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutUtilityInput | CustomerProfileDataModelCreateOrConnectWithoutUtilityInput[]
    createMany?: CustomerProfileDataModelCreateManyUtilityInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type EnumSIGNIN_WITHFieldUpdateOperationsInput = {
    set?: $Enums.SIGNIN_WITH
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CustomerProfileDataModelUpdateManyWithoutUtilityNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput> | CustomerProfileDataModelCreateWithoutUtilityInput[] | CustomerProfileDataModelUncheckedCreateWithoutUtilityInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutUtilityInput | CustomerProfileDataModelCreateOrConnectWithoutUtilityInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutUtilityInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutUtilityInput[]
    createMany?: CustomerProfileDataModelCreateManyUtilityInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutUtilityInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutUtilityInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutUtilityInput | CustomerProfileDataModelUpdateManyWithWhereWithoutUtilityInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutUtilityNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput> | CustomerProfileDataModelCreateWithoutUtilityInput[] | CustomerProfileDataModelUncheckedCreateWithoutUtilityInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutUtilityInput | CustomerProfileDataModelCreateOrConnectWithoutUtilityInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutUtilityInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutUtilityInput[]
    createMany?: CustomerProfileDataModelCreateManyUtilityInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutUtilityInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutUtilityInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutUtilityInput | CustomerProfileDataModelUpdateManyWithWhereWithoutUtilityInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomersAuthDataModelCreateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: CustomersAuthDataModelCreateOrConnectWithoutCustomerProfileDataModelInput
    connect?: CustomersAuthDataModelWhereUniqueInput
  }

  export type AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput = {
    create?: XOR<AADHAARCardModelCreateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: AADHAARCardModelCreateOrConnectWithoutCustomerProfileDataModelInput
    connect?: AADHAARCardModelWhereUniqueInput
  }

  export type PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput = {
    create?: XOR<PanCardModelCreateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: PanCardModelCreateOrConnectWithoutCustomerProfileDataModelInput
    connect?: PanCardModelWhereUniqueInput
  }

  export type CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomerPersonalInfoModelCreateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: CustomerPersonalInfoModelCreateOrConnectWithoutCustomerProfileDataModelInput
    connect?: CustomerPersonalInfoModelWhereUniqueInput
  }

  export type CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersBankAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    connect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
  }

  export type CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersDematAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    connect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
  }

  export type AddressModelCreateNestedOneWithoutCurrentAddressOfInput = {
    create?: XOR<AddressModelCreateWithoutCurrentAddressOfInput, AddressModelUncheckedCreateWithoutCurrentAddressOfInput>
    connectOrCreate?: AddressModelCreateOrConnectWithoutCurrentAddressOfInput
    connect?: AddressModelWhereUniqueInput
  }

  export type AddressModelCreateNestedOneWithoutPermanentAddressOfInput = {
    create?: XOR<AddressModelCreateWithoutPermanentAddressOfInput, AddressModelUncheckedCreateWithoutPermanentAddressOfInput>
    connectOrCreate?: AddressModelCreateOrConnectWithoutPermanentAddressOfInput
    connect?: AddressModelWhereUniqueInput
  }

  export type CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersBankAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    connect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
  }

  export type CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput = {
    create?: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersDematAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    connect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
  }

  export type EnumGenderFieldUpdateOperationsInput = {
    set?: $Enums.Gender
  }

  export type EnumUserAccountTypeFieldUpdateOperationsInput = {
    set?: $Enums.UserAccountType
  }

  export type EnumKYCStatusFieldUpdateOperationsInput = {
    set?: $Enums.KYCStatus
  }

  export type CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomersAuthDataModelCreateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: CustomersAuthDataModelCreateOrConnectWithoutCustomerProfileDataModelInput
    upsert?: CustomersAuthDataModelUpsertWithoutCustomerProfileDataModelInput
    connect?: CustomersAuthDataModelWhereUniqueInput
    update?: XOR<XOR<CustomersAuthDataModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUpdateWithoutCustomerProfileDataModelInput>, CustomersAuthDataModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<AADHAARCardModelCreateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: AADHAARCardModelCreateOrConnectWithoutCustomerProfileDataModelInput
    upsert?: AADHAARCardModelUpsertWithoutCustomerProfileDataModelInput
    disconnect?: AADHAARCardModelWhereInput | boolean
    delete?: AADHAARCardModelWhereInput | boolean
    connect?: AADHAARCardModelWhereUniqueInput
    update?: XOR<XOR<AADHAARCardModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput, AADHAARCardModelUpdateWithoutCustomerProfileDataModelInput>, AADHAARCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<PanCardModelCreateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: PanCardModelCreateOrConnectWithoutCustomerProfileDataModelInput
    upsert?: PanCardModelUpsertWithoutCustomerProfileDataModelInput
    disconnect?: PanCardModelWhereInput | boolean
    delete?: PanCardModelWhereInput | boolean
    connect?: PanCardModelWhereUniqueInput
    update?: XOR<XOR<PanCardModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput, PanCardModelUpdateWithoutCustomerProfileDataModelInput>, PanCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomerPersonalInfoModelCreateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    connectOrCreate?: CustomerPersonalInfoModelCreateOrConnectWithoutCustomerProfileDataModelInput
    upsert?: CustomerPersonalInfoModelUpsertWithoutCustomerProfileDataModelInput
    disconnect?: CustomerPersonalInfoModelWhereInput | boolean
    delete?: CustomerPersonalInfoModelWhereInput | boolean
    connect?: CustomerPersonalInfoModelWhereUniqueInput
    update?: XOR<XOR<CustomerPersonalInfoModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUpdateWithoutCustomerProfileDataModelInput>, CustomerPersonalInfoModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    upsert?: CustomersBankAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersBankAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    set?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    disconnect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    delete?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    connect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    update?: CustomersBankAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    updateMany?: CustomersBankAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput[]
    deleteMany?: CustomersBankAccountModelScalarWhereInput | CustomersBankAccountModelScalarWhereInput[]
  }

  export type CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    upsert?: CustomersDematAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersDematAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    set?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    disconnect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    delete?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    connect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    update?: CustomersDematAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    updateMany?: CustomersDematAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput[]
    deleteMany?: CustomersDematAccountModelScalarWhereInput | CustomersDematAccountModelScalarWhereInput[]
  }

  export type AddressModelUpdateOneWithoutCurrentAddressOfNestedInput = {
    create?: XOR<AddressModelCreateWithoutCurrentAddressOfInput, AddressModelUncheckedCreateWithoutCurrentAddressOfInput>
    connectOrCreate?: AddressModelCreateOrConnectWithoutCurrentAddressOfInput
    upsert?: AddressModelUpsertWithoutCurrentAddressOfInput
    disconnect?: AddressModelWhereInput | boolean
    delete?: AddressModelWhereInput | boolean
    connect?: AddressModelWhereUniqueInput
    update?: XOR<XOR<AddressModelUpdateToOneWithWhereWithoutCurrentAddressOfInput, AddressModelUpdateWithoutCurrentAddressOfInput>, AddressModelUncheckedUpdateWithoutCurrentAddressOfInput>
  }

  export type AddressModelUpdateOneWithoutPermanentAddressOfNestedInput = {
    create?: XOR<AddressModelCreateWithoutPermanentAddressOfInput, AddressModelUncheckedCreateWithoutPermanentAddressOfInput>
    connectOrCreate?: AddressModelCreateOrConnectWithoutPermanentAddressOfInput
    upsert?: AddressModelUpsertWithoutPermanentAddressOfInput
    disconnect?: AddressModelWhereInput | boolean
    delete?: AddressModelWhereInput | boolean
    connect?: AddressModelWhereUniqueInput
    update?: XOR<XOR<AddressModelUpdateToOneWithWhereWithoutPermanentAddressOfInput, AddressModelUpdateWithoutPermanentAddressOfInput>, AddressModelUncheckedUpdateWithoutPermanentAddressOfInput>
  }

  export type CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    upsert?: CustomersBankAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersBankAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    set?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    disconnect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    delete?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    connect?: CustomersBankAccountModelWhereUniqueInput | CustomersBankAccountModelWhereUniqueInput[]
    update?: CustomersBankAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    updateMany?: CustomersBankAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput | CustomersBankAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput[]
    deleteMany?: CustomersBankAccountModelScalarWhereInput | CustomersBankAccountModelScalarWhereInput[]
  }

  export type CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput = {
    create?: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput> | CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput[] | CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput[]
    connectOrCreate?: CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput | CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput[]
    upsert?: CustomersDematAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    createMany?: CustomersDematAccountModelCreateManyCustomerProfileDataModelInputEnvelope
    set?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    disconnect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    delete?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    connect?: CustomersDematAccountModelWhereUniqueInput | CustomersDematAccountModelWhereUniqueInput[]
    update?: CustomersDematAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput[]
    updateMany?: CustomersDematAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput | CustomersDematAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput[]
    deleteMany?: CustomersDematAccountModelScalarWhereInput | CustomersDematAccountModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutPersonalInformationInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput> | CustomerProfileDataModelCreateWithoutPersonalInformationInput[] | CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput | CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput[]
    createMany?: CustomerProfileDataModelCreateManyPersonalInformationInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutPersonalInformationInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput> | CustomerProfileDataModelCreateWithoutPersonalInformationInput[] | CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput | CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput[]
    createMany?: CustomerProfileDataModelCreateManyPersonalInformationInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUpdateManyWithoutPersonalInformationNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput> | CustomerProfileDataModelCreateWithoutPersonalInformationInput[] | CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput | CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPersonalInformationInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPersonalInformationInput[]
    createMany?: CustomerProfileDataModelCreateManyPersonalInformationInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPersonalInformationInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPersonalInformationInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPersonalInformationInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPersonalInformationInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPersonalInformationNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput> | CustomerProfileDataModelCreateWithoutPersonalInformationInput[] | CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput | CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPersonalInformationInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPersonalInformationInput[]
    createMany?: CustomerProfileDataModelCreateManyPersonalInformationInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPersonalInformationInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPersonalInformationInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPersonalInformationInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPersonalInformationInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutAadhaarCardInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput> | CustomerProfileDataModelCreateWithoutAadhaarCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput | CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput[]
    createMany?: CustomerProfileDataModelCreateManyAadhaarCardInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutAadhaarCardInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput> | CustomerProfileDataModelCreateWithoutAadhaarCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput | CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput[]
    createMany?: CustomerProfileDataModelCreateManyAadhaarCardInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUpdateManyWithoutAadhaarCardNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput> | CustomerProfileDataModelCreateWithoutAadhaarCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput | CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutAadhaarCardInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutAadhaarCardInput[]
    createMany?: CustomerProfileDataModelCreateManyAadhaarCardInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutAadhaarCardInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutAadhaarCardInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutAadhaarCardInput | CustomerProfileDataModelUpdateManyWithWhereWithoutAadhaarCardInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutAadhaarCardNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput> | CustomerProfileDataModelCreateWithoutAadhaarCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput | CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutAadhaarCardInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutAadhaarCardInput[]
    createMany?: CustomerProfileDataModelCreateManyAadhaarCardInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutAadhaarCardInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutAadhaarCardInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutAadhaarCardInput | CustomerProfileDataModelUpdateManyWithWhereWithoutAadhaarCardInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutPanCardInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput> | CustomerProfileDataModelCreateWithoutPanCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutPanCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPanCardInput | CustomerProfileDataModelCreateOrConnectWithoutPanCardInput[]
    createMany?: CustomerProfileDataModelCreateManyPanCardInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutPanCardInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput> | CustomerProfileDataModelCreateWithoutPanCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutPanCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPanCardInput | CustomerProfileDataModelCreateOrConnectWithoutPanCardInput[]
    createMany?: CustomerProfileDataModelCreateManyPanCardInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUpdateManyWithoutPanCardNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput> | CustomerProfileDataModelCreateWithoutPanCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutPanCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPanCardInput | CustomerProfileDataModelCreateOrConnectWithoutPanCardInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPanCardInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPanCardInput[]
    createMany?: CustomerProfileDataModelCreateManyPanCardInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPanCardInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPanCardInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPanCardInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPanCardInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPanCardNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput> | CustomerProfileDataModelCreateWithoutPanCardInput[] | CustomerProfileDataModelUncheckedCreateWithoutPanCardInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPanCardInput | CustomerProfileDataModelCreateOrConnectWithoutPanCardInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPanCardInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPanCardInput[]
    createMany?: CustomerProfileDataModelCreateManyPanCardInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPanCardInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPanCardInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPanCardInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPanCardInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelCreateNestedOneWithoutBankAccountsInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutBankAccountsInput>
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutBankAccountsInput
    connect?: CustomerProfileDataModelWhereUniqueInput
  }

  export type CustomerProfileDataModelUpdateOneWithoutBankAccountsNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutBankAccountsInput>
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutBankAccountsInput
    upsert?: CustomerProfileDataModelUpsertWithoutBankAccountsInput
    disconnect?: CustomerProfileDataModelWhereInput | boolean
    delete?: CustomerProfileDataModelWhereInput | boolean
    connect?: CustomerProfileDataModelWhereUniqueInput
    update?: XOR<XOR<CustomerProfileDataModelUpdateToOneWithWhereWithoutBankAccountsInput, CustomerProfileDataModelUpdateWithoutBankAccountsInput>, CustomerProfileDataModelUncheckedUpdateWithoutBankAccountsInput>
  }

  export type CustomerProfileDataModelCreateNestedOneWithoutDematAccountsInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutDematAccountsInput>
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutDematAccountsInput
    connect?: CustomerProfileDataModelWhereUniqueInput
  }

  export type EnumDepositoryNameFieldUpdateOperationsInput = {
    set?: $Enums.DepositoryName
  }

  export type EnumDematAccountTypeFieldUpdateOperationsInput = {
    set?: $Enums.DematAccountType
  }

  export type CustomerProfileDataModelUpdateOneWithoutDematAccountsNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutDematAccountsInput>
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutDematAccountsInput
    upsert?: CustomerProfileDataModelUpsertWithoutDematAccountsInput
    disconnect?: CustomerProfileDataModelWhereInput | boolean
    delete?: CustomerProfileDataModelWhereInput | boolean
    connect?: CustomerProfileDataModelWhereUniqueInput
    update?: XOR<XOR<CustomerProfileDataModelUpdateToOneWithWhereWithoutDematAccountsInput, CustomerProfileDataModelUpdateWithoutDematAccountsInput>, CustomerProfileDataModelUncheckedUpdateWithoutDematAccountsInput>
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutCurrentAddressInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput> | CustomerProfileDataModelCreateWithoutCurrentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyCurrentAddressInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelCreateNestedManyWithoutPermanentAddressInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput> | CustomerProfileDataModelCreateWithoutPermanentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyPermanentAddressInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutCurrentAddressInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput> | CustomerProfileDataModelCreateWithoutCurrentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyCurrentAddressInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUncheckedCreateNestedManyWithoutPermanentAddressInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput> | CustomerProfileDataModelCreateWithoutPermanentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyPermanentAddressInputEnvelope
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
  }

  export type CustomerProfileDataModelUpdateManyWithoutCurrentAddressNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput> | CustomerProfileDataModelCreateWithoutCurrentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutCurrentAddressInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutCurrentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyCurrentAddressInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutCurrentAddressInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutCurrentAddressInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutCurrentAddressInput | CustomerProfileDataModelUpdateManyWithWhereWithoutCurrentAddressInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUpdateManyWithoutPermanentAddressNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput> | CustomerProfileDataModelCreateWithoutPermanentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPermanentAddressInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPermanentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyPermanentAddressInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPermanentAddressInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPermanentAddressInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPermanentAddressInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPermanentAddressInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutCurrentAddressNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput> | CustomerProfileDataModelCreateWithoutCurrentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutCurrentAddressInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutCurrentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyCurrentAddressInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutCurrentAddressInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutCurrentAddressInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutCurrentAddressInput | CustomerProfileDataModelUpdateManyWithWhereWithoutCurrentAddressInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPermanentAddressNestedInput = {
    create?: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput> | CustomerProfileDataModelCreateWithoutPermanentAddressInput[] | CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput[]
    connectOrCreate?: CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput | CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput[]
    upsert?: CustomerProfileDataModelUpsertWithWhereUniqueWithoutPermanentAddressInput | CustomerProfileDataModelUpsertWithWhereUniqueWithoutPermanentAddressInput[]
    createMany?: CustomerProfileDataModelCreateManyPermanentAddressInputEnvelope
    set?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    disconnect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    delete?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    connect?: CustomerProfileDataModelWhereUniqueInput | CustomerProfileDataModelWhereUniqueInput[]
    update?: CustomerProfileDataModelUpdateWithWhereUniqueWithoutPermanentAddressInput | CustomerProfileDataModelUpdateWithWhereUniqueWithoutPermanentAddressInput[]
    updateMany?: CustomerProfileDataModelUpdateManyWithWhereWithoutPermanentAddressInput | CustomerProfileDataModelUpdateManyWithWhereWithoutPermanentAddressInput[]
    deleteMany?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
  }

  export type EnumLeadSourceFieldUpdateOperationsInput = {
    set?: $Enums.LeadSource
  }

  export type EnumBondTypeFieldUpdateOperationsInput = {
    set?: $Enums.BondType
  }

  export type EnumLeadStatusFieldUpdateOperationsInput = {
    set?: $Enums.LeadStatus
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumCrmUserROLEFilter<$PrismaModel = never> = {
    equals?: $Enums.CrmUserROLE | EnumCrmUserROLEFieldRefInput<$PrismaModel>
    in?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumCrmUserROLEFilter<$PrismaModel> | $Enums.CrmUserROLE
  }

  export type NestedEnumAccountStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusFilter<$PrismaModel> | $Enums.AccountStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumCrmUserROLEWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CrmUserROLE | EnumCrmUserROLEFieldRefInput<$PrismaModel>
    in?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.CrmUserROLE[] | ListEnumCrmUserROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumCrmUserROLEWithAggregatesFilter<$PrismaModel> | $Enums.CrmUserROLE
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCrmUserROLEFilter<$PrismaModel>
    _max?: NestedEnumCrmUserROLEFilter<$PrismaModel>
  }

  export type NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountStatus | EnumAccountStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountStatus[] | ListEnumAccountStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountStatusWithAggregatesFilter<$PrismaModel> | $Enums.AccountStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountStatusFilter<$PrismaModel>
    _max?: NestedEnumAccountStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumSIGNIN_WITHFilter<$PrismaModel = never> = {
    equals?: $Enums.SIGNIN_WITH | EnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    in?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    notIn?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    not?: NestedEnumSIGNIN_WITHFilter<$PrismaModel> | $Enums.SIGNIN_WITH
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumSIGNIN_WITHWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SIGNIN_WITH | EnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    in?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    notIn?: $Enums.SIGNIN_WITH[] | ListEnumSIGNIN_WITHFieldRefInput<$PrismaModel>
    not?: NestedEnumSIGNIN_WITHWithAggregatesFilter<$PrismaModel> | $Enums.SIGNIN_WITH
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSIGNIN_WITHFilter<$PrismaModel>
    _max?: NestedEnumSIGNIN_WITHFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumGenderFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel>
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    not?: NestedEnumGenderFilter<$PrismaModel> | $Enums.Gender
  }

  export type NestedEnumUserAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UserAccountType | EnumUserAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserAccountTypeFilter<$PrismaModel> | $Enums.UserAccountType
  }

  export type NestedEnumKYCStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.KYCStatus | EnumKYCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKYCStatusFilter<$PrismaModel> | $Enums.KYCStatus
  }

  export type NestedEnumGenderWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel>
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel>
    not?: NestedEnumGenderWithAggregatesFilter<$PrismaModel> | $Enums.Gender
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGenderFilter<$PrismaModel>
    _max?: NestedEnumGenderFilter<$PrismaModel>
  }

  export type NestedEnumUserAccountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserAccountType | EnumUserAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserAccountType[] | ListEnumUserAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUserAccountTypeWithAggregatesFilter<$PrismaModel> | $Enums.UserAccountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserAccountTypeFilter<$PrismaModel>
    _max?: NestedEnumUserAccountTypeFilter<$PrismaModel>
  }

  export type NestedEnumKYCStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.KYCStatus | EnumKYCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.KYCStatus[] | ListEnumKYCStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumKYCStatusWithAggregatesFilter<$PrismaModel> | $Enums.KYCStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumKYCStatusFilter<$PrismaModel>
    _max?: NestedEnumKYCStatusFilter<$PrismaModel>
  }

  export type NestedEnumDepositoryNameFilter<$PrismaModel = never> = {
    equals?: $Enums.DepositoryName | EnumDepositoryNameFieldRefInput<$PrismaModel>
    in?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    notIn?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    not?: NestedEnumDepositoryNameFilter<$PrismaModel> | $Enums.DepositoryName
  }

  export type NestedEnumDematAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DematAccountType | EnumDematAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDematAccountTypeFilter<$PrismaModel> | $Enums.DematAccountType
  }

  export type NestedEnumDepositoryNameWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DepositoryName | EnumDepositoryNameFieldRefInput<$PrismaModel>
    in?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    notIn?: $Enums.DepositoryName[] | ListEnumDepositoryNameFieldRefInput<$PrismaModel>
    not?: NestedEnumDepositoryNameWithAggregatesFilter<$PrismaModel> | $Enums.DepositoryName
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDepositoryNameFilter<$PrismaModel>
    _max?: NestedEnumDepositoryNameFilter<$PrismaModel>
  }

  export type NestedEnumDematAccountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DematAccountType | EnumDematAccountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.DematAccountType[] | ListEnumDematAccountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumDematAccountTypeWithAggregatesFilter<$PrismaModel> | $Enums.DematAccountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDematAccountTypeFilter<$PrismaModel>
    _max?: NestedEnumDematAccountTypeFilter<$PrismaModel>
  }

  export type NestedEnumLeadSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadSource | EnumLeadSourceFieldRefInput<$PrismaModel>
    in?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadSourceFilter<$PrismaModel> | $Enums.LeadSource
  }

  export type NestedEnumBondTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BondType | EnumBondTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBondTypeFilter<$PrismaModel> | $Enums.BondType
  }

  export type NestedEnumLeadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusFilter<$PrismaModel> | $Enums.LeadStatus
  }

  export type NestedEnumLeadSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadSource | EnumLeadSourceFieldRefInput<$PrismaModel>
    in?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadSource[] | ListEnumLeadSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadSourceWithAggregatesFilter<$PrismaModel> | $Enums.LeadSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadSourceFilter<$PrismaModel>
    _max?: NestedEnumLeadSourceFilter<$PrismaModel>
  }

  export type NestedEnumBondTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BondType | EnumBondTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BondType[] | ListEnumBondTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBondTypeWithAggregatesFilter<$PrismaModel> | $Enums.BondType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBondTypeFilter<$PrismaModel>
    _max?: NestedEnumBondTypeFilter<$PrismaModel>
  }

  export type NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadStatusFilter<$PrismaModel>
    _max?: NestedEnumLeadStatusFilter<$PrismaModel>
  }

  export type CustomerProfileDataModelCreateWithoutUtilityInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutUtilityInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutUtilityInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput>
  }

  export type CustomerProfileDataModelCreateManyUtilityInputEnvelope = {
    data: CustomerProfileDataModelCreateManyUtilityInput | CustomerProfileDataModelCreateManyUtilityInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutUtilityInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutUtilityInput, CustomerProfileDataModelUncheckedUpdateWithoutUtilityInput>
    create: XOR<CustomerProfileDataModelCreateWithoutUtilityInput, CustomerProfileDataModelUncheckedCreateWithoutUtilityInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutUtilityInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutUtilityInput, CustomerProfileDataModelUncheckedUpdateWithoutUtilityInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutUtilityInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutUtilityInput>
  }

  export type CustomerProfileDataModelScalarWhereInput = {
    AND?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
    OR?: CustomerProfileDataModelScalarWhereInput[]
    NOT?: CustomerProfileDataModelScalarWhereInput | CustomerProfileDataModelScalarWhereInput[]
    id?: IntFilter<"CustomerProfileDataModel"> | number
    userName?: StringFilter<"CustomerProfileDataModel"> | string
    firstName?: StringFilter<"CustomerProfileDataModel"> | string
    middleName?: StringFilter<"CustomerProfileDataModel"> | string
    lastName?: StringFilter<"CustomerProfileDataModel"> | string
    gender?: EnumGenderFilter<"CustomerProfileDataModel"> | $Enums.Gender
    emailAddress?: StringFilter<"CustomerProfileDataModel"> | string
    phoneNo?: StringFilter<"CustomerProfileDataModel"> | string
    whatsAppNo?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    avatar?: StringNullableFilter<"CustomerProfileDataModel"> | string | null
    userType?: EnumUserAccountTypeFilter<"CustomerProfileDataModel"> | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFilter<"CustomerProfileDataModel"> | $Enums.KYCStatus
    VerifiedBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customersAuthDataModelId?: IntFilter<"CustomerProfileDataModel"> | number
    createdAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomerProfileDataModel"> | Date | string
    createdBy?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    aADHAARCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    panCardModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    customerPersonalInfoModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    currentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
    permanentAddressModelId?: IntNullableFilter<"CustomerProfileDataModel"> | number | null
  }

  export type CustomersAuthDataModelCreateWithoutCustomerProfileDataModelInput = {
    password?: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus?: $Enums.AccountStatus
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersAuthDataModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    password?: string | null
    signinWith: $Enums.SIGNIN_WITH
    accountStatus?: $Enums.AccountStatus
    isPhoneVerified?: boolean
    isEmailVerified?: boolean
    whatsAppNotificationAllow?: boolean
    termsAccepted?: boolean
    lastLogin?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersAuthDataModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: CustomersAuthDataModelWhereUniqueInput
    create: XOR<CustomersAuthDataModelCreateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type AADHAARCardModelCreateWithoutCustomerProfileDataModelInput = {
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AADHAARCardModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    fatherName: string
    aadhaarNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    image: string
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AADHAARCardModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: AADHAARCardModelWhereUniqueInput
    create: XOR<AADHAARCardModelCreateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type PanCardModelCreateWithoutCustomerProfileDataModelInput = {
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PanCardModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    firstName: string
    middleName: string
    lastName: string
    panCardNo: string
    dateOfBirth: string
    gender: $Enums.Gender
    isVerified?: boolean
    verifyDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PanCardModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: PanCardModelWhereUniqueInput
    create: XOR<PanCardModelCreateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomerPersonalInfoModelCreateWithoutCustomerProfileDataModelInput = {
    SignatureUrl?: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName?: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerPersonalInfoModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    SignatureUrl?: string | null
    maritalStatus: string
    occupationType: string
    annualGrossIncome: string
    fatherOrSpouseName: string
    mothersName: string
    nationality: string
    maidenName?: string | null
    residentialStatus: string
    qualification: string
    politicallyExposedPerson?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomerPersonalInfoModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: CustomerPersonalInfoModelWhereUniqueInput
    create: XOR<CustomerPersonalInfoModelCreateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput = {
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersBankAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: CustomersBankAccountModelWhereUniqueInput
    create: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelCreateManyCustomerProfileDataModelInputEnvelope = {
    data: CustomersBankAccountModelCreateManyCustomerProfileDataModelInput | CustomersBankAccountModelCreateManyCustomerProfileDataModelInput[]
    skipDuplicates?: boolean
  }

  export type CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput = {
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput = {
    id?: number
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersDematAccountModelCreateOrConnectWithoutCustomerProfileDataModelInput = {
    where: CustomersDematAccountModelWhereUniqueInput
    create: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersDematAccountModelCreateManyCustomerProfileDataModelInputEnvelope = {
    data: CustomersDematAccountModelCreateManyCustomerProfileDataModelInput | CustomersDematAccountModelCreateManyCustomerProfileDataModelInput[]
    skipDuplicates?: boolean
  }

  export type AddressModelCreateWithoutCurrentAddressOfInput = {
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permanentAddressOf?: CustomerProfileDataModelCreateNestedManyWithoutPermanentAddressInput
  }

  export type AddressModelUncheckedCreateWithoutCurrentAddressOfInput = {
    id?: number
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permanentAddressOf?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutPermanentAddressInput
  }

  export type AddressModelCreateOrConnectWithoutCurrentAddressOfInput = {
    where: AddressModelWhereUniqueInput
    create: XOR<AddressModelCreateWithoutCurrentAddressOfInput, AddressModelUncheckedCreateWithoutCurrentAddressOfInput>
  }

  export type AddressModelCreateWithoutPermanentAddressOfInput = {
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentAddressOf?: CustomerProfileDataModelCreateNestedManyWithoutCurrentAddressInput
  }

  export type AddressModelUncheckedCreateWithoutPermanentAddressOfInput = {
    id?: number
    line1: string
    line2?: string | null
    line3?: string | null
    postOffice: string
    cityOrDistrict: string
    state: string
    pinCode: string
    country: string
    fullAddress: string
    createdAt?: Date | string
    updatedAt?: Date | string
    currentAddressOf?: CustomerProfileDataModelUncheckedCreateNestedManyWithoutCurrentAddressInput
  }

  export type AddressModelCreateOrConnectWithoutPermanentAddressOfInput = {
    where: AddressModelWhereUniqueInput
    create: XOR<AddressModelCreateWithoutPermanentAddressOfInput, AddressModelUncheckedCreateWithoutPermanentAddressOfInput>
  }

  export type CustomersAuthDataModelUpsertWithoutCustomerProfileDataModelInput = {
    update: XOR<CustomersAuthDataModelUpdateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<CustomersAuthDataModelCreateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    where?: CustomersAuthDataModelWhereInput
  }

  export type CustomersAuthDataModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput = {
    where?: CustomersAuthDataModelWhereInput
    data: XOR<CustomersAuthDataModelUpdateWithoutCustomerProfileDataModelInput, CustomersAuthDataModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersAuthDataModelUpdateWithoutCustomerProfileDataModelInput = {
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersAuthDataModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    password?: NullableStringFieldUpdateOperationsInput | string | null
    signinWith?: EnumSIGNIN_WITHFieldUpdateOperationsInput | $Enums.SIGNIN_WITH
    accountStatus?: EnumAccountStatusFieldUpdateOperationsInput | $Enums.AccountStatus
    isPhoneVerified?: BoolFieldUpdateOperationsInput | boolean
    isEmailVerified?: BoolFieldUpdateOperationsInput | boolean
    whatsAppNotificationAllow?: BoolFieldUpdateOperationsInput | boolean
    termsAccepted?: BoolFieldUpdateOperationsInput | boolean
    lastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AADHAARCardModelUpsertWithoutCustomerProfileDataModelInput = {
    update: XOR<AADHAARCardModelUpdateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<AADHAARCardModelCreateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    where?: AADHAARCardModelWhereInput
  }

  export type AADHAARCardModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput = {
    where?: AADHAARCardModelWhereInput
    data: XOR<AADHAARCardModelUpdateWithoutCustomerProfileDataModelInput, AADHAARCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type AADHAARCardModelUpdateWithoutCustomerProfileDataModelInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AADHAARCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    fatherName?: StringFieldUpdateOperationsInput | string
    aadhaarNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    image?: StringFieldUpdateOperationsInput | string
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PanCardModelUpsertWithoutCustomerProfileDataModelInput = {
    update: XOR<PanCardModelUpdateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<PanCardModelCreateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    where?: PanCardModelWhereInput
  }

  export type PanCardModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput = {
    where?: PanCardModelWhereInput
    data: XOR<PanCardModelUpdateWithoutCustomerProfileDataModelInput, PanCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type PanCardModelUpdateWithoutCustomerProfileDataModelInput = {
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PanCardModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    panCardNo?: StringFieldUpdateOperationsInput | string
    dateOfBirth?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifyDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerPersonalInfoModelUpsertWithoutCustomerProfileDataModelInput = {
    update: XOR<CustomerPersonalInfoModelUpdateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<CustomerPersonalInfoModelCreateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedCreateWithoutCustomerProfileDataModelInput>
    where?: CustomerPersonalInfoModelWhereInput
  }

  export type CustomerPersonalInfoModelUpdateToOneWithWhereWithoutCustomerProfileDataModelInput = {
    where?: CustomerPersonalInfoModelWhereInput
    data: XOR<CustomerPersonalInfoModelUpdateWithoutCustomerProfileDataModelInput, CustomerPersonalInfoModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomerPersonalInfoModelUpdateWithoutCustomerProfileDataModelInput = {
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerPersonalInfoModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    SignatureUrl?: NullableStringFieldUpdateOperationsInput | string | null
    maritalStatus?: StringFieldUpdateOperationsInput | string
    occupationType?: StringFieldUpdateOperationsInput | string
    annualGrossIncome?: StringFieldUpdateOperationsInput | string
    fatherOrSpouseName?: StringFieldUpdateOperationsInput | string
    mothersName?: StringFieldUpdateOperationsInput | string
    nationality?: StringFieldUpdateOperationsInput | string
    maidenName?: NullableStringFieldUpdateOperationsInput | string | null
    residentialStatus?: StringFieldUpdateOperationsInput | string
    qualification?: StringFieldUpdateOperationsInput | string
    politicallyExposedPerson?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput = {
    where: CustomersBankAccountModelWhereUniqueInput
    update: XOR<CustomersBankAccountModelUpdateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<CustomersBankAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput = {
    where: CustomersBankAccountModelWhereUniqueInput
    data: XOR<CustomersBankAccountModelUpdateWithoutCustomerProfileDataModelInput, CustomersBankAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput = {
    where: CustomersBankAccountModelScalarWhereInput
    data: XOR<CustomersBankAccountModelUpdateManyMutationInput, CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelInput>
  }

  export type CustomersBankAccountModelScalarWhereInput = {
    AND?: CustomersBankAccountModelScalarWhereInput | CustomersBankAccountModelScalarWhereInput[]
    OR?: CustomersBankAccountModelScalarWhereInput[]
    NOT?: CustomersBankAccountModelScalarWhereInput | CustomersBankAccountModelScalarWhereInput[]
    id?: IntFilter<"CustomersBankAccountModel"> | number
    accountHolderName?: StringFilter<"CustomersBankAccountModel"> | string
    bankAccountType?: StringFilter<"CustomersBankAccountModel"> | string
    accountNumber?: StringFilter<"CustomersBankAccountModel"> | string
    ifscCode?: StringFilter<"CustomersBankAccountModel"> | string
    bankName?: StringFilter<"CustomersBankAccountModel"> | string
    branch?: StringFilter<"CustomersBankAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersBankAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersBankAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersBankAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersBankAccountModel"> | Date | string
  }

  export type CustomersDematAccountModelUpsertWithWhereUniqueWithoutCustomerProfileDataModelInput = {
    where: CustomersDematAccountModelWhereUniqueInput
    update: XOR<CustomersDematAccountModelUpdateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
    create: XOR<CustomersDematAccountModelCreateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedCreateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersDematAccountModelUpdateWithWhereUniqueWithoutCustomerProfileDataModelInput = {
    where: CustomersDematAccountModelWhereUniqueInput
    data: XOR<CustomersDematAccountModelUpdateWithoutCustomerProfileDataModelInput, CustomersDematAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput>
  }

  export type CustomersDematAccountModelUpdateManyWithWhereWithoutCustomerProfileDataModelInput = {
    where: CustomersDematAccountModelScalarWhereInput
    data: XOR<CustomersDematAccountModelUpdateManyMutationInput, CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelInput>
  }

  export type CustomersDematAccountModelScalarWhereInput = {
    AND?: CustomersDematAccountModelScalarWhereInput | CustomersDematAccountModelScalarWhereInput[]
    OR?: CustomersDematAccountModelScalarWhereInput[]
    NOT?: CustomersDematAccountModelScalarWhereInput | CustomersDematAccountModelScalarWhereInput[]
    id?: IntFilter<"CustomersDematAccountModel"> | number
    depositoryName?: EnumDepositoryNameFilter<"CustomersDematAccountModel"> | $Enums.DepositoryName
    dpId?: StringFilter<"CustomersDematAccountModel"> | string
    clientId?: StringFilter<"CustomersDematAccountModel"> | string
    accountType?: EnumDematAccountTypeFilter<"CustomersDematAccountModel"> | $Enums.DematAccountType
    depositoryParticipantName?: StringFilter<"CustomersDematAccountModel"> | string
    primaryPanNumber?: StringFilter<"CustomersDematAccountModel"> | string
    sndPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    trdPanNumber?: StringNullableFilter<"CustomersDematAccountModel"> | string | null
    accountHolderName?: StringFilter<"CustomersDematAccountModel"> | string
    isPrimary?: BoolFilter<"CustomersDematAccountModel"> | boolean
    isVerified?: BoolFilter<"CustomersDematAccountModel"> | boolean
    customerProfileDataModelId?: IntNullableFilter<"CustomersDematAccountModel"> | number | null
    createdAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
    updatedAt?: DateTimeFilter<"CustomersDematAccountModel"> | Date | string
  }

  export type AddressModelUpsertWithoutCurrentAddressOfInput = {
    update: XOR<AddressModelUpdateWithoutCurrentAddressOfInput, AddressModelUncheckedUpdateWithoutCurrentAddressOfInput>
    create: XOR<AddressModelCreateWithoutCurrentAddressOfInput, AddressModelUncheckedCreateWithoutCurrentAddressOfInput>
    where?: AddressModelWhereInput
  }

  export type AddressModelUpdateToOneWithWhereWithoutCurrentAddressOfInput = {
    where?: AddressModelWhereInput
    data: XOR<AddressModelUpdateWithoutCurrentAddressOfInput, AddressModelUncheckedUpdateWithoutCurrentAddressOfInput>
  }

  export type AddressModelUpdateWithoutCurrentAddressOfInput = {
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permanentAddressOf?: CustomerProfileDataModelUpdateManyWithoutPermanentAddressNestedInput
  }

  export type AddressModelUncheckedUpdateWithoutCurrentAddressOfInput = {
    id?: IntFieldUpdateOperationsInput | number
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permanentAddressOf?: CustomerProfileDataModelUncheckedUpdateManyWithoutPermanentAddressNestedInput
  }

  export type AddressModelUpsertWithoutPermanentAddressOfInput = {
    update: XOR<AddressModelUpdateWithoutPermanentAddressOfInput, AddressModelUncheckedUpdateWithoutPermanentAddressOfInput>
    create: XOR<AddressModelCreateWithoutPermanentAddressOfInput, AddressModelUncheckedCreateWithoutPermanentAddressOfInput>
    where?: AddressModelWhereInput
  }

  export type AddressModelUpdateToOneWithWhereWithoutPermanentAddressOfInput = {
    where?: AddressModelWhereInput
    data: XOR<AddressModelUpdateWithoutPermanentAddressOfInput, AddressModelUncheckedUpdateWithoutPermanentAddressOfInput>
  }

  export type AddressModelUpdateWithoutPermanentAddressOfInput = {
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentAddressOf?: CustomerProfileDataModelUpdateManyWithoutCurrentAddressNestedInput
  }

  export type AddressModelUncheckedUpdateWithoutPermanentAddressOfInput = {
    id?: IntFieldUpdateOperationsInput | number
    line1?: StringFieldUpdateOperationsInput | string
    line2?: NullableStringFieldUpdateOperationsInput | string | null
    line3?: NullableStringFieldUpdateOperationsInput | string | null
    postOffice?: StringFieldUpdateOperationsInput | string
    cityOrDistrict?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    pinCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentAddressOf?: CustomerProfileDataModelUncheckedUpdateManyWithoutCurrentAddressNestedInput
  }

  export type CustomerProfileDataModelCreateWithoutPersonalInformationInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutPersonalInformationInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput>
  }

  export type CustomerProfileDataModelCreateManyPersonalInformationInputEnvelope = {
    data: CustomerProfileDataModelCreateManyPersonalInformationInput | CustomerProfileDataModelCreateManyPersonalInformationInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutPersonalInformationInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedUpdateWithoutPersonalInformationInput>
    create: XOR<CustomerProfileDataModelCreateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedCreateWithoutPersonalInformationInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutPersonalInformationInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutPersonalInformationInput, CustomerProfileDataModelUncheckedUpdateWithoutPersonalInformationInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutPersonalInformationInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutPersonalInformationInput>
  }

  export type CustomerProfileDataModelCreateWithoutAadhaarCardInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutAadhaarCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput>
  }

  export type CustomerProfileDataModelCreateManyAadhaarCardInputEnvelope = {
    data: CustomerProfileDataModelCreateManyAadhaarCardInput | CustomerProfileDataModelCreateManyAadhaarCardInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutAadhaarCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedUpdateWithoutAadhaarCardInput>
    create: XOR<CustomerProfileDataModelCreateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedCreateWithoutAadhaarCardInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutAadhaarCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutAadhaarCardInput, CustomerProfileDataModelUncheckedUpdateWithoutAadhaarCardInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutAadhaarCardInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutAadhaarCardInput>
  }

  export type CustomerProfileDataModelCreateWithoutPanCardInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutPanCardInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutPanCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput>
  }

  export type CustomerProfileDataModelCreateManyPanCardInputEnvelope = {
    data: CustomerProfileDataModelCreateManyPanCardInput | CustomerProfileDataModelCreateManyPanCardInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutPanCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutPanCardInput, CustomerProfileDataModelUncheckedUpdateWithoutPanCardInput>
    create: XOR<CustomerProfileDataModelCreateWithoutPanCardInput, CustomerProfileDataModelUncheckedCreateWithoutPanCardInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutPanCardInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutPanCardInput, CustomerProfileDataModelUncheckedUpdateWithoutPanCardInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutPanCardInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutPanCardInput>
  }

  export type CustomerProfileDataModelCreateWithoutBankAccountsInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutBankAccountsInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutBankAccountsInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutBankAccountsInput>
  }

  export type CustomerProfileDataModelUpsertWithoutBankAccountsInput = {
    update: XOR<CustomerProfileDataModelUpdateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedUpdateWithoutBankAccountsInput>
    create: XOR<CustomerProfileDataModelCreateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutBankAccountsInput>
    where?: CustomerProfileDataModelWhereInput
  }

  export type CustomerProfileDataModelUpdateToOneWithWhereWithoutBankAccountsInput = {
    where?: CustomerProfileDataModelWhereInput
    data: XOR<CustomerProfileDataModelUpdateWithoutBankAccountsInput, CustomerProfileDataModelUncheckedUpdateWithoutBankAccountsInput>
  }

  export type CustomerProfileDataModelUpdateWithoutBankAccountsInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutBankAccountsInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelCreateWithoutDematAccountsInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutDematAccountsInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutDematAccountsInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutDematAccountsInput>
  }

  export type CustomerProfileDataModelUpsertWithoutDematAccountsInput = {
    update: XOR<CustomerProfileDataModelUpdateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedUpdateWithoutDematAccountsInput>
    create: XOR<CustomerProfileDataModelCreateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedCreateWithoutDematAccountsInput>
    where?: CustomerProfileDataModelWhereInput
  }

  export type CustomerProfileDataModelUpdateToOneWithWhereWithoutDematAccountsInput = {
    where?: CustomerProfileDataModelWhereInput
    data: XOR<CustomerProfileDataModelUpdateWithoutDematAccountsInput, CustomerProfileDataModelUncheckedUpdateWithoutDematAccountsInput>
  }

  export type CustomerProfileDataModelUpdateWithoutDematAccountsInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutDematAccountsInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelCreateWithoutCurrentAddressInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    permanentAddress?: AddressModelCreateNestedOneWithoutPermanentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    permanentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutCurrentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput>
  }

  export type CustomerProfileDataModelCreateManyCurrentAddressInputEnvelope = {
    data: CustomerProfileDataModelCreateManyCurrentAddressInput | CustomerProfileDataModelCreateManyCurrentAddressInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelCreateWithoutPermanentAddressInput = {
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    utility: CustomersAuthDataModelCreateNestedOneWithoutCustomerProfileDataModelInput
    aadhaarCard?: AADHAARCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    panCard?: PanCardModelCreateNestedOneWithoutCustomerProfileDataModelInput
    personalInformation?: CustomerPersonalInfoModelCreateNestedOneWithoutCustomerProfileDataModelInput
    bankAccounts?: CustomersBankAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelCreateNestedManyWithoutCustomerProfileDataModelInput
    currentAddress?: AddressModelCreateNestedOneWithoutCurrentAddressOfInput
  }

  export type CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    bankAccounts?: CustomersBankAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
    dematAccounts?: CustomersDematAccountModelUncheckedCreateNestedManyWithoutCustomerProfileDataModelInput
  }

  export type CustomerProfileDataModelCreateOrConnectWithoutPermanentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    create: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput>
  }

  export type CustomerProfileDataModelCreateManyPermanentAddressInputEnvelope = {
    data: CustomerProfileDataModelCreateManyPermanentAddressInput | CustomerProfileDataModelCreateManyPermanentAddressInput[]
    skipDuplicates?: boolean
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutCurrentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedUpdateWithoutCurrentAddressInput>
    create: XOR<CustomerProfileDataModelCreateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutCurrentAddressInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutCurrentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutCurrentAddressInput, CustomerProfileDataModelUncheckedUpdateWithoutCurrentAddressInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutCurrentAddressInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutCurrentAddressInput>
  }

  export type CustomerProfileDataModelUpsertWithWhereUniqueWithoutPermanentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    update: XOR<CustomerProfileDataModelUpdateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedUpdateWithoutPermanentAddressInput>
    create: XOR<CustomerProfileDataModelCreateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedCreateWithoutPermanentAddressInput>
  }

  export type CustomerProfileDataModelUpdateWithWhereUniqueWithoutPermanentAddressInput = {
    where: CustomerProfileDataModelWhereUniqueInput
    data: XOR<CustomerProfileDataModelUpdateWithoutPermanentAddressInput, CustomerProfileDataModelUncheckedUpdateWithoutPermanentAddressInput>
  }

  export type CustomerProfileDataModelUpdateManyWithWhereWithoutPermanentAddressInput = {
    where: CustomerProfileDataModelScalarWhereInput
    data: XOR<CustomerProfileDataModelUpdateManyMutationInput, CustomerProfileDataModelUncheckedUpdateManyWithoutPermanentAddressInput>
  }

  export type CustomerProfileDataModelCreateManyUtilityInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateWithoutUtilityInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutUtilityInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutUtilityInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomersBankAccountModelCreateManyCustomerProfileDataModelInput = {
    id?: number
    accountHolderName: string
    bankAccountType: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersDematAccountModelCreateManyCustomerProfileDataModelInput = {
    id?: number
    depositoryName: $Enums.DepositoryName
    dpId: string
    clientId: string
    accountType: $Enums.DematAccountType
    depositoryParticipantName: string
    primaryPanNumber: string
    sndPanNumber?: string | null
    trdPanNumber?: string | null
    accountHolderName: string
    isPrimary?: boolean
    isVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustomersBankAccountModelUpdateWithoutCustomerProfileDataModelInput = {
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    accountHolderName?: StringFieldUpdateOperationsInput | string
    bankAccountType?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    ifscCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    branch?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelUpdateWithoutCustomerProfileDataModelInput = {
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelUncheckedUpdateWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    depositoryName?: EnumDepositoryNameFieldUpdateOperationsInput | $Enums.DepositoryName
    dpId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    accountType?: EnumDematAccountTypeFieldUpdateOperationsInput | $Enums.DematAccountType
    depositoryParticipantName?: StringFieldUpdateOperationsInput | string
    primaryPanNumber?: StringFieldUpdateOperationsInput | string
    sndPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    trdPanNumber?: NullableStringFieldUpdateOperationsInput | string | null
    accountHolderName?: StringFieldUpdateOperationsInput | string
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerProfileDataModelCreateManyPersonalInformationInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateWithoutPersonalInformationInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutPersonalInformationInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPersonalInformationInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerProfileDataModelCreateManyAadhaarCardInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateWithoutAadhaarCardInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutAadhaarCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutAadhaarCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerProfileDataModelCreateManyPanCardInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateWithoutPanCardInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutPanCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPanCardInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerProfileDataModelCreateManyCurrentAddressInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    permanentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelCreateManyPermanentAddressInput = {
    id?: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: $Enums.Gender
    emailAddress: string
    phoneNo: string
    whatsAppNo?: string | null
    avatar?: string | null
    userType?: $Enums.UserAccountType
    kycStatus?: $Enums.KYCStatus
    VerifiedBy?: number | null
    customersAuthDataModelId: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: number | null
    aADHAARCardModelId?: number | null
    panCardModelId?: number | null
    customerPersonalInfoModelId?: number | null
    currentAddressModelId?: number | null
  }

  export type CustomerProfileDataModelUpdateWithoutCurrentAddressInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    permanentAddress?: AddressModelUpdateOneWithoutPermanentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutCurrentAddressInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutCurrentAddressInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    permanentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type CustomerProfileDataModelUpdateWithoutPermanentAddressInput = {
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    utility?: CustomersAuthDataModelUpdateOneRequiredWithoutCustomerProfileDataModelNestedInput
    aadhaarCard?: AADHAARCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    panCard?: PanCardModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    personalInformation?: CustomerPersonalInfoModelUpdateOneWithoutCustomerProfileDataModelNestedInput
    bankAccounts?: CustomersBankAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUpdateManyWithoutCustomerProfileDataModelNestedInput
    currentAddress?: AddressModelUpdateOneWithoutCurrentAddressOfNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateWithoutPermanentAddressInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
    bankAccounts?: CustomersBankAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
    dematAccounts?: CustomersDematAccountModelUncheckedUpdateManyWithoutCustomerProfileDataModelNestedInput
  }

  export type CustomerProfileDataModelUncheckedUpdateManyWithoutPermanentAddressInput = {
    id?: IntFieldUpdateOperationsInput | number
    userName?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    middleName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    gender?: EnumGenderFieldUpdateOperationsInput | $Enums.Gender
    emailAddress?: StringFieldUpdateOperationsInput | string
    phoneNo?: StringFieldUpdateOperationsInput | string
    whatsAppNo?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: EnumUserAccountTypeFieldUpdateOperationsInput | $Enums.UserAccountType
    kycStatus?: EnumKYCStatusFieldUpdateOperationsInput | $Enums.KYCStatus
    VerifiedBy?: NullableIntFieldUpdateOperationsInput | number | null
    customersAuthDataModelId?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableIntFieldUpdateOperationsInput | number | null
    aADHAARCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    panCardModelId?: NullableIntFieldUpdateOperationsInput | number | null
    customerPersonalInfoModelId?: NullableIntFieldUpdateOperationsInput | number | null
    currentAddressModelId?: NullableIntFieldUpdateOperationsInput | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}