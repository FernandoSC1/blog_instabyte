import {getTodosPosts, criarPost, atualizarPost, deletarPost} from "../models/postsModel.js";
import fs from "fs";

export async function listarPosts(req, res) {
    // Chama a função para buscar os posts
    const posts = await getTodosPosts();
    // Envia uma resposta HTTP com status 200 (OK) e os posts no formato JSON
    res.status(200).json(posts);
}

/*export async function postarNovoPost(req, res) {
    const novoPost = req.body;
    try {
        const postCriado = await criarPost(novoPost);
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}*/

export async function postarNovoPost(req, res) {
    const {descricao, alt} = req.body;
    const novoPost = {
        descricao: descricao,
        imagemUrl: req.file.originalname,
        alt: alt
    };

    try {
        const postCriado = await criarPost(novoPost);
        const idPostCriado = `${postCriado.insertedId}`;
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`;
        fs.renameSync(req.file.path, imagemAtualizada);
        res.status(200).json(postCriado);
        
        const urlImagem = `http://localhost:3000/uploads/${idPostCriado}.png`;
        const postAtualizado = {
            imagemUrl: urlImagem
        };

        await atualizarPost(idPostCriado, postAtualizado);

    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"});
    }
}

/*export async function atualizarNovoPost(req, res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/uploads/${id}.png`;
    
    try {

        const postAtualizado = {
            imagemUrl: urlImagem,
            descricao: req.body.descricao,
            alt: req.body.alt
        };

        const postCriado = await atualizarPost(id, postAtualizado);
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    };
};*/

export async function deletarUmPost(req, res) {
    const id = req.params.id;
    const caminhoImagem = `uploads/${id}.png`; // Ajustar o caminho conforme sua estrutura de arquivos

    try {
        await deletarPost(id);

        // Verifica se o arquivo existe antes de tentar deletar
        if (fs.existsSync(caminhoImagem)) {
            fs.unlink(caminhoImagem, (err) => {
                if (err) {
                    console.error(`Erro ao excluir a imagem: ${err}`);
                } else {
                    console.log('Imagem excluída com sucesso');
                }
            });
        }

        res.status(200).json({ mensagem: 'Post deletado com sucesso' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Erro ao deletar o post' });
    }
}