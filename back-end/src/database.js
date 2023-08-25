import { createConnection } from "mysql2/promise";
import { config } from "./config.js";

export const DBConn = await createConnection(config.database)
DBConn.connect()

/**
 * Verifica a existência de uma conta no banco de dados comparando um objeto onde as chaves são as colunas com os valores para serem comparados
 * @param {{[string]?: any}} fields 
 */
export async function checkAccountExistance(fields) {
    const result = await DBConn.execute(`SELECT COUNT(*) FROM accounts WHERE ${Object.keys(fields).map(key => `${key}=?`).join(" AND ")} LIMIT 1`, Object.values(fields));
    return result[0][0]['COUNT(*)'] > 0;
}

/**
 * Cria uma conta no banco de dados salvando os valores de um objeto onde chaves são as colunas
 * @param {{[string]?: any}} fields 
 */
export async function createAccount(fields) {
    if (await checkAccountExistance(fields))
        return false;

    await DBConn.execute(`INSERT INTO accounts(${Object.keys(fields).join(", ")}) VALUES(${Object.values(fields).map(() => '?').join(", ")})`, Object.values(fields));
    return true;
}

/**
 * Busca uma conta no banco de dados e retorna suas informações
 * @param {{[string]?: any}} fields 
 */
export async function getAccountInfo(fields) {
    if (!await checkAccountExistance(fields))
        return null;

    const info = await DBConn.execute(`SELECT * FROM accounts WHERE ${Object.keys(fields).map(key => `${key}=?`).join(" AND ")} LIMIT 1`, Object.values(fields));
    return info[0][0];
}