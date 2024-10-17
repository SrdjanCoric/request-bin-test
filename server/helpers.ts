/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = require('pg');
const mongoose = require('mongoose');
const Request = require('./models/requests');
require('dotenv').config();

export const pool = new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  host: 'localhost',
});

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI);

export async function createAndAddNewBinId(): Promise<string> {
  while (true) {
    try {
      const uuidTest = uuidv4();
      const binId = uuidTest.split('-').join('').slice(0, 13);
      const query = 'INSERT INTO request_bin (bin_id) VALUES ($1)';
      await pool.query(query, [binId]);
      return binId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Duplicate bin_id', error.message);
      }
    }
  }
}

// Passed request object, parsed method, path, body, returns id
export async function addToMongo(req: express.Request): Promise<string | void> {
  console.log(req.params.bin_id)
  try {
    if ((await checkBinExists(req.params.bin_id)) === false) {
      throw new Error('Bin does not exist!');
    }
    const { method, path, url, headers, query, body } = req;
    const request = new Request({
      method,
      path,
      url,
      headers: JSON.stringify(headers),
      query: JSON.stringify(query),
      body: JSON.stringify(body),
    });
    const mongoRequestId = await request.save();
    return String(mongoRequestId._id);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

export async function addToPostgres(
  method: string,
  url: string,
  mongoRequestId: string | void,
  binId: string, // external binId
  requestId: string,
) {
  let internalId;
  try {
    const queryBinTable = `SELECT id FROM request_bin WHERE bin_id = $1`
    const resultBinTable = await pool.query(queryBinTable, [binId]);
    internalId = resultBinTable.rows[0].id
    console.log(internalId)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    }
  }

  try {
    const query = `
    INSERT INTO request (requestbin_id, mongo_key, method, path_name, request_id) 
    VALUES ($1, $2, $3, $4, $5)
    `;
    const res = await pool.query(query, [internalId, mongoRequestId, method, url, requestId]);
    console.log(res);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

export async function getRequestsFromPostgres(binId: string): Promise<any> {
  try {
    const query = `
    SELECT path_name, method, request_id, to_char(created_at, 
    'HH24:MI:SS') || ' ' || to_char(created_at, 'FMMonth DD, YYYY') as created_at FROM request r
    JOIN request_bin b ON b.id = r.requestbin_id
    WHERE b.bin_id = $1;
    `;

    const result = await pool.query(query, [binId]);
    return result.rows.map((obj: any) => {
      const { path_name, method, request_id, created_at } = obj;
      return { path: path_name, method, id: request_id, time: created_at };
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

export async function getRequestFromPostgres(binId: string, requestId: string) {
  try {
    if ((await checkBinExists(binId)) === false) {
      throw new Error('Bin does not exist!');
    }

    if ((await checkRequestExists(requestId)) === false) {
      throw new Error('Request does not exist!');
    }
    const query = `
    SELECT mongo_key FROM request WHERE request_id = $1;
    `;
    // URL: http://localhost:3000/api/XyZ123Abc4567/requests/4038b9f1-e949-4a48-9026-528fbdadc26f
    console.log('requestExists function');
    const result = await pool.query(query, [requestId]);
    const mongoKey = result.rows[0].mongo_key;
    console.log(result.rows[0].created_at);
    console.log(typeof result.rows[0].created_at);
    console.log('mongokey = ' + mongoKey);

    // TODO: Get Mongo key and return result object from mongo
    const request = await Request.findById(mongoKey);
    console.log('request from mongo = ' + request)
    return request;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

async function checkBinExists(binId: string) {
  try {
    const query = `
    SELECT id FROM request_bin WHERE bin_id = $1;
    `;
    console.log('checkBinExists function');
    console.log({ binId });
    const result = await pool.query(query, [binId]);
    return result.rowCount !== 0;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

async function checkRequestExists(requestId: string) {
  try {
    const query = `
    SELECT mongo_key FROM request WHERE request_id = $1;
    `;
    console.log('checkRequestExists function');
    const result = await pool.query(query, [requestId]);
    return result.rowCount !== 0;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}
