import express from "express"; // Importa o framework Express para criar a aplicação web
import multer from "multer"; // Importa o Multer para lidar com uploads de arquivos
import { listarPosts, postarNovoPost, /*uploadImagem, atualizarNovoPost,*/ deletarUmPost } from "../controllers/postsController.js"; // Importa as funções controladoras para lidar com a lógica dos posts
import cors from "cors";
import fs from 'fs';
import path from 'path';

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}

// Configura o armazenamento do Multer para uploads de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Especifica o diretório para armazenar as imagens enviadas
    cb(null, 'uploads/'); // Substitua por seu caminho de upload desejado
  },
  filename: function (req, file, cb) {
    // Mantém o nome original do arquivo por simplicidade
    cb(null, file.originalname); // Considere usar uma estratégia de geração de nomes únicos para produção
  }
});

// Cria uma instância do middleware Multer
const upload = multer({ storage: storage });

// Define as rotas usando o objeto Express app
const routes = (app) => {
  // Permite que o servidor interprete corpos de requisições no formato JSON
  app.use(express.json());
  app.use(cors(corsOptions));
  
  // Rota para recuperar uma lista de todos os posts
  app.get("/posts", listarPosts); // Chama a função controladora apropriada

  // Rota para criar um novo post
  //app.post("/posts", postarNovoPost); // Chama a função controladora para criação de posts

  // Rota para upload de imagens (assumindo uma única imagem chamada "imagem")
  app.post("/upload", upload.single("imagem"), postarNovoPost); // Chama a função controladora para processamento da imagem

  //app.put("/upload/:id", atualizarNovoPost);

  app.delete("/posts/:id", deletarUmPost);

  app.get("/uploads", (req, res) => {
    fs.readdir('uploads', (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao listar arquivos' });
      }

      // Filtra apenas arquivos PNG
      const pngFiles = files.filter(file => file.endsWith('.png'));

      // Gera o HTML para exibir as imagens com seus nomes
      const imagesHtml = pngFiles.map(file => {
        return `
          <div style="display: inline-block; margin: 10px; text-align: center;">
            <img src="/uploads/${file}" alt="${file}" style="width: 200px;" />
            <div>${file}</div>
          </div>
        `;
      }).join('');

      // Exibe todas as imagens com seus nomes em uma única página HTML
      res.send(`
        <html>
          <head><title>Imagens PNG</title></head>
          <body>
            <h1>Gerenciador de IMAGENS</h1>
            <div>${imagesHtml}</div>
          </body>
        </html>
      `);
    });
  });
};

export default routes;
