import express from "express";
import Evento from "../models/eventos.js";
import isAuthenticated from "../helpers/isAuthenticated.js";
import currentUser from "../helpers/currentUser.js";
import jwtAuthenticated from "../helpers/jwtAuthenticated.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user = await currentUser(req);
  if(isAuthenticated(req)){
    res.render("home", { isAuthenticated: isAuthenticated(req), nombre: user.name, pagInicio: true }); 
  }
  else{
    res.render("home",{ isAuthenticated: isAuthenticated(req), pagInicio: true} )
  }
});

router.get("/eventos", async (req, res) => {
  const user = await currentUser(req);
  const events = await Evento.find({});
  if(isAuthenticated(req)){
    res.json(
      {allEvents: events.map((current) => {
        return {
          id: current.id,
          nombre_evento: current.nombre_evento,
          fecha_creacion: current.fecha_creacion,
        };
      }),
      isAuthenticated: isAuthenticated(req),
      pagElecc: true,
      nombre: user.name}
    )
  }
  else{
    res.json(
      {allEvents: events.map((current) => {
        return {
          id: current.id,
          nombre_evento: current.nombre_evento,
          fecha_creacion: current.fecha_creacion,
        };
      }),
      isAuthenticated: isAuthenticated(req),
      pagElecc: true,}
    )
  }
});


router.get("/eventos/:id/", async (req, res) => {
  const user = await currentUser(req);
  const idEvento = req.params.id;
  const evento = await Evento.findOne({_id: idEvento})
  let admin = true;
  if(!user || user.rut !== evento.rut_admin){
    admin = false;
  }
  if(isAuthenticated(req)){
    res.json({isAuthenticated: isAuthenticated(req),
      id: evento._id,
      nombre_evento: evento.nombre_evento,
      candidato1: evento.candidato1,
      candidato1_votos: evento.candidato1_votos,
      candidato2: evento.candidato2,
      candidato2_votos: evento.candidato2_votos,
      candidato3: evento.candidato3,
      candidato3_votos: evento.candidato3_votos,
      estado: evento.estado,
      admin: admin,
      nombre: user.name,
     })
  }
  else{
    res.json({
      id: evento._id,
      nombre_evento: evento.nombre_evento,
      candidato1: evento.candidato1,
      candidato1_votos: evento.candidato1_votos,
      candidato2: evento.candidato2,
      candidato2_votos: evento.candidato2_votos,
      candidato3: evento.candidato3,
      candidato3_votos: evento.candidato3_votos,
      estado: evento.estado,
      admin: admin,
      isAuthenticated: isAuthenticated(req),
     })
  }
});

router.get("/votaciones", async (req, res) => {
  const events = await Evento.find({});
  const user = await currentUser(req);
  if(isAuthenticated(req)){
    res.render("votaciones", {
      allEvents: events.map((current) => {
        return {
          id: current.id,
          nombre_evento: current.nombre_evento,
          estado: current.estado
        };
      }),
      isAuthenticated: isAuthenticated(req),
      nombre: user.name,
    });
  }
  else{
    res.render("votaciones", {
      allEvents: events.map((current) => {
        return {
          id: current.id,
          nombre_evento: current.nombre_evento,
          estado: current.estado
        };
      }),
      isAuthenticated: isAuthenticated(req),
    });
  }
})

router.get("/eventos/:id/votar", async (req, res) => {
  const user = await currentUser(req);
  const idEvento = req.params.id;
  let nombre = null;
  const evento = await Evento.findOne({_id: idEvento})
  if(isAuthenticated(req)){
    res.render("votar", {isAuthenticated: isAuthenticated(req),
      id: evento._id,
      nombre_evento: evento.nombre_evento,
      candidato1: evento.candidato1,
      candidato2: evento.candidato2,
      candidato3: evento.candidato3,
      nombre: nombre = user.name,
      })
  }
  else{
    res.render("votar", {isAuthenticated: isAuthenticated(req),
      id: evento._id,
      nombre_evento: evento.nombre_evento,
      candidato1: evento.candidato1,
      candidato2: evento.candidato2,
      candidato3: evento.candidato3,
      })
  }
});

router.post('/eventos/:id/votar', async (req, res) => {
  const idEvento = req.params.id;
  const evento = await Evento.findOne({_id: idEvento})
  const { numCandidato } = req.body;
  if(evento.estado){
    if (numCandidato === "candidato1") {
      evento.candidato1_votos++;
    } else if (numCandidato === "candidato2") {
      evento.candidato2_votos++;
    } else if (numCandidato === "candidato3") {
      evento.candidato3_votos++;
    }
    await evento.save();
    res.json({success: true, message: "Voto exitoso"});
  }
  else{
    res.json({success: false, message: "Evento finalizado"})
  }
});

router.get("/eventos/crear",jwtAuthenticated, async (req, res) => {
  const user = await currentUser(req);
  if(isAuthenticated(req)){
    res.render("user/crear_evento", { isAuthenticated: isAuthenticated(req), nombre: user.name} );
  }
  else{
    res.render("user/crear_evento", { isAuthenticated: isAuthenticated(req) } );
  }
});

router.post("/eventos/crear",jwtAuthenticated, async (req, res) => {
  const user = await currentUser(req);
  const crearEvento = {
    nombre_evento: req.body.nombre_evento,
    candidato1: req.body.candidato1,
    candidato2: req.body.candidato2,
    candidato3: req.body.candidato3,
    rut_admin: user.rut,
  }
  Evento.create(crearEvento);
  res.json({success: true, message: "Evento creado"});
});

router.post("/eventos/actualizarEstado", jwtAuthenticated, async (req,res)=>{
  const user = await currentUser(req);
  const idEvento = req.body.id_evento;
  const estado_Evento= req.body.estado;
  const evento = await Evento.findOne({_id: idEvento})
  if(!user || user.rut !== evento.rut_admin){
    res.json({success: false, message:"Solo usuario que creo el evento puede cambiar el estado o no hay usuario ingresado"});
  }
  else{
    evento.estado = estado_Evento;
    await evento.save();
    res.json({success: true, message:"Actualizacion exitosa"});
  }
});


export default router;