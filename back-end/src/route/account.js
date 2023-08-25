import express from "express";
import { compare, hash } from "bcrypt";

import { checkAccountExistance, createAccount, getAccountInfo } from "../database.js";

export const AccountRouter = express.Router();

AccountRouter.post("/signup", async (req, res) => {
    const { name, username, password, email, cpf } = req.body;

    if (await checkAccountExistance({username})) {
        return res.json({
            ok: false,
            message: 'Já existe um usuário com este nome.'
        });
    } else if (await checkAccountExistance({email})) {
        return res.json({
            ok: false,
            message: 'Já existe um usuário com este email.'
        });
    } else if (await checkAccountExistance({cpf})) {
        return res.json({
            ok: false,
            message: 'Já existe um usuário com este CPF.'
        });
    }

    const hashedPassword = await hash(password, 12);

    if (await createAccount({name, username, password: hashedPassword, email, cpf})) {
        const info = await getAccountInfo({name, username, password: hashedPassword, email, cpf});

        req.session.loggedIn = true;
        req.session.accountInfo = info;

        req.session.save();

        return res.json({
            ok: true,
            message: 'Conta criada com sucesso'
        });
    }

    res.json({
        ok: false,
        message: 'Não foi possível processar solicitação, tente novamente depois.'
    });
});

AccountRouter.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!await checkAccountExistance({username})) {
        return res.json({
            ok: false,
            message: `Usuário inválido.`
        });
    }

    const info = await getAccountInfo({username});

    if (info === null) {
        return res.json({
            ok: false,
            message: "Conta não encontrada."
        });
    }

    if (!await compare(password, info.password)) {
        return res.json({
            ok: false,
            message: "Senha inválida"
        });
    }

    req.session.loggedIn = true;
    req.session.accountInfo = info;
    req.session.save();

    res.json({
        ok: true,
        message: 'Logado com sucesso'
    });
});

AccountRouter.get("/logout", async (req, res) => {
    req.session.destroy();
    res.json({ok: true});
});