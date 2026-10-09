import type { TSCONFIG_JSON_SCHEMA_LITE } from "../src/json-schema.js";
import type {
  TsconfigCompilerOptions,
  TsConfigJson,
  TsconfigReferences,
  TsconfigTypeAcquisition,
  TsconfigWatchOptions,
} from "../src/tsconfig-json.js";

/**
 * Type-level tests (no runtime assertions) checked by `tsc --noEmit` via the
 * `typecheck` script - not executed by `node --test`.
 *
 * These verify that `tsconfig-json.ts`'s hand-written types aren't missing any
 * key that the upstream schema (baked into `json-schema.ts`) declares.
 */

type Definitions = (typeof TSCONFIG_JSON_SCHEMA_LITE)["definitions"];

type MissingKeys<
  SchemaKeys extends PropertyKey,
  TypeKeys extends PropertyKey,
> = [Exclude<SchemaKeys, TypeKeys>] extends [never]
  ? true
  : { missingFromType: Exclude<SchemaKeys, TypeKeys> };

// `compilerOptions` - the big one, ~140 keys and the whole point of this package.
type CompilerOptionsSchemaKeys =
  keyof Definitions["compilerOptionsDefinition"]["properties"]["compilerOptions"]["anyOf"][0]["properties"];
true satisfies MissingKeys<
  CompilerOptionsSchemaKeys,
  keyof TsconfigCompilerOptions
>;

// `watchOptions`
type WatchOptionsSchemaKeys =
  keyof Definitions["watchOptionsDefinition"]["properties"]["watchOptions"]["anyOf"][0]["properties"];
true satisfies MissingKeys<WatchOptionsSchemaKeys, keyof TsconfigWatchOptions>;

// `typeAcquisition`
type TypeAcquisitionSchemaKeys =
  keyof Definitions["typeAcquisitionDefinition"]["properties"]["typeAcquisition"]["anyOf"][0]["properties"];
true satisfies MissingKeys<
  TypeAcquisitionSchemaKeys,
  keyof TsconfigTypeAcquisition
>;

// a `references` array entry
type ReferenceSchemaKeys =
  keyof Definitions["referencesDefinition"]["properties"]["references"]["items"]["properties"];
true satisfies MissingKeys<ReferenceSchemaKeys, keyof TsconfigReferences>;

// root-level keys, gathered from every `*Definition` the schema `allOf`s together.
type RootSchemaKeys =
  | keyof Definitions["compilerOptionsDefinition"]["properties"]
  | keyof Definitions["compileOnSaveDefinition"]["properties"]
  | keyof Definitions["typeAcquisitionDefinition"]["properties"]
  | keyof Definitions["extendsDefinition"]["properties"]
  | keyof Definitions["watchOptionsDefinition"]["properties"]
  | keyof Definitions["filesDefinition"]["properties"]
  | keyof Definitions["excludeDefinition"]["properties"]
  | keyof Definitions["includeDefinition"]["properties"]
  | keyof Definitions["referencesDefinition"]["properties"];
true satisfies MissingKeys<RootSchemaKeys, keyof TsConfigJson>;
