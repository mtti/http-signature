/*
Copyright 2020 Matti Hiltunen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { HeaderDictionary } from './HeaderDictionary';

export type CreateInputOptions = {
  method?: string;
  requestPath?: string;
  created?: number;
  expires?: number;
  headers?: readonly string[];
  headerValues?: HeaderDictionary;
};

const mergeValues = (values: string|string[]): string => {
  if (Array.isArray(values)) {
    return values.join(', ');
  }
  return values;
};

/** Generates a signature input string */
export const createInput = (
  options: CreateInputOptions,
): string => {
  const headers = options.headers || ['(created)'];
  let requestTarget: string|null = null;
  if (options.method && options.requestPath) {
    requestTarget = `${options.method.toLowerCase()} ${options.requestPath}`;
  }

  const lines = headers.map((header) => {
    if (header === '(request-target)') {
      if (!requestTarget) {
        throw new Error('Missing request target');
      }
      return `(request-target): ${requestTarget}`;
    }
    if (header === '(created)') {
      const { created } = options;
      if (!created) {
        throw new Error('Missing parameter: created');
      }
      return `(created): ${created}`;
    }
    if (header === '(expired)') {
      const { expires } = options;
      if (!expires) {
        throw new Error('Missing parameter: expires');
      }
      return `(expired): ${expires}`;
    }

    if (!options.headerValues) {
      throw new Error(`Missing header: ${header}`);
    }
    const value = options.headerValues[header];
    if (!value) {
      throw new Error(`Missing header: ${header}`);
    }
    return `${header}: ${mergeValues(value)}`;
  });

  return lines.join('\n');
};
