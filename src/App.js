import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { faCoffee, faCheck, faUtensils, faHamburger } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Form, Modal, Navbar } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import ReactLoading from "react-loading";

let intervalVideo;
let produtoSelecionado;
let pessoaSelecionada;

const pessoas = [
  "Gilson Fernandes Jr",
  "Manuel Padrão Duque",
  "Eleonora Delvalle de Álvares",
  "Hortência Vívian Colaço de Lutero",
  "Luciana Marlene Benites",
  "Francielle Caldeira de Garcia",
  "Eliomar Tatiana Cortês de Cardoso",
  "Maria Suzy Reis Rocha",
  "Edu Paz Martinez",
  "Ana Marina Corona Ferminiano Couto"
];
const produtos = [
  { tipo: 0, nome: "Omelete", descricao: "Um prato feito de ovos batidos com manteiga ou óleo, geralmente com outros ingredientes como queijo, presunto, ervas aromáticas ou uma combinações destes", image: "menu-1.jpg", preco: "12,00" },
  { tipo: 0, nome: "Salada de Frutas", descricao: "Um prato que consiste de uma combinação de várias frutas picadas, temperado com açúcar, às vezes servidos em um líquido, seja em seus próprios sucos ou um licor", image: "menu-2.jpg", preco: "6,50" },
  { tipo: 0, nome: "Waffle", descricao: "Um tipo de massa doce de origem belga, confeccionado com farinha, açúcar, manteiga, ovos e leite, cozido num molde onde é prensado em um ferro que imprime texturas quadriculares sobre a massa.", image: "menu-3.jpg", preco: "14,35" },
  { tipo: 0, nome: "Bauru", descricao: "Tiras finas de rosbife frio, rodelas de pepino pequeno em conserva, fatias de tomate e pão francês sem miolo, em cuja cavidade vai uma mistura de três queijos preparados dentro de água quente. ", image: "menu-4.jpg", preco: "8,50" },
  { tipo: 0, nome: "Bolo de chocholate", descricao: "É um bolo simples ou confeitado, que leva chocolate derretido ou em pó, ou ainda cacau em pó em sua confecção", image: "menu-5.jpg", preco: "5,50" },
  { tipo: 0, nome: "Croissant", descricao: "É um tipo de viennoiserie de massa folhada em formato de meia-lua, feito de farinha, açúcar, sal, leite, fermento, manteiga e ovo para pincelar.", image: "menu-6.jpg", preco: "6,50" },
  { tipo: 0, nome: "Brusqueta", descricao: "É um antepasto italiano feito com uma fatia de pão rústico, de farinha escura e grossa, de casca dura, tostada na grelha, esfregada com alho, untada com abundante azeite e polvilhada com sal e eventualmente com pimenta-do-reino. ", image: "menu-7.jpg", preco: "20,50" },
  { tipo: 0, nome: "Pastel", descricao: "É um alimento composto por uma massa à base de farinha a que se dá a forma de um envelope, se recheia e depois se frita por imersão em óleo fervente.", image: "menu-8.jpg", preco: "8,50" },
  { tipo: 1, nome: "Suco", descricao: "É uma bebida produzida do líquido extraído de frutas.", image: "menu-9.jpg", preco: "5,00" },
  { tipo: 1, nome: "Refrigerante", descricao: "É uma bebida não alcoólica e não fermentada, fabricada industrialmente, à base de água mineral e açúcar,", image: "menu-10.jpg", preco: "5,00" },
  { tipo: 1, nome: "Soda Italiana", descricao: "É preparada de forma artesanal com xarope de frutas, água gaseificada e gelo.", image: "menu-11.jpg", preco: "8,50" },
  { tipo: 1, nome: "Chá", descricao: "É uma bebida preparada através da infusão de folhas, flores, raízes de planta do chá", image: "menu-12.jpg", preco: "3,50" },
];

function App() {
  const [showModalCamera, setShowModalCamera] = useState(false);
  const handleCloseModalCamera = () => { setShowModalCamera(false); closeWebcam(); };
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const handleCloseModalConfirm = () => { setShowModalConfirm(false); };
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef();
  const canvasRef = useRef();

  const videoHeight = 480;
  const videoWidth = 640;

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]).then(setModelsLoaded(true));
    }
    loadModels();

    setTimeout(() => {
      setLoading(false);
    }, 300)
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = () => {
    intervalVideo = setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        if (detections.length > 0) {
          setTimeout(() => {
            handleCloseModalCamera();
            setShowModalConfirm(true);
          }, 800)
        }

      }
    }, 500)
  }

  const closeWebcam = () => {
    clearInterval(intervalVideo);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject.getTracks()[0].stop();
    }
    setCaptureVideo(false);
  }



  const btnComprar = (idxProduto) => {
    produtoSelecionado = produtos[idxProduto];
    pessoaSelecionada = pessoas[Math.floor(Math.random() * pessoas.length)];
    // setShowModalConfirm(true);

    setShowModalCamera(true);

    if (!(captureVideo && modelsLoaded))
      startVideo();
  }

  return (
    <div className="App">
      {loading ?
        <ReactLoading className='contentCenter' type="spin" color="orange" height={'10%'} width={'10%'} />
        :
        <>
          <Navbar bg="dark" data-bs-theme="dark" className="bg-body-tertiary" >
            <Container>
              <Navbar.Brand href="#home">
                <p style={{ fontFamily: 'Pacifico' }}>
                  <FontAwesomeIcon icon={faUtensils} size='2x' color='orange' style={{ marginRight: "10px" }} />
                  Cantina Digital
                </p>
              </Navbar.Brand>
            </Container>
          </Navbar>

          <Container>

            <Modal size='lg' className='mt-2' show={showModalCamera} onHide={handleCloseModalCamera}>
              <Modal.Header closeButton>
                <Modal.Title>Reconhecimento Facial</Modal.Title>
              </Modal.Header>
              <Modal.Body>Insira seu rosto para validar a compra!</Modal.Body>

              <div>
                {
                  captureVideo ?
                    modelsLoaded ?
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                          <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                          <canvas ref={canvasRef} style={{ position: 'absolute' }} />
                        </div>
                      </div>
                      :
                      <div>Carregando...</div>
                    :
                    <div>Carregando...</div>
                }
              </div>

            </Modal>

            <Modal size='sm' show={showModalConfirm} onHide={handleCloseModalConfirm}>
              <Modal.Header closeButton>
                <Modal.Title>Compra efetuada!</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ backgroundColor: "#28a745" }}>
                <div style={{ textAlign: "center" }}>
                  <FontAwesomeIcon icon={faCheck} size='5x' color='white' />
                </div>

                <h3 style={{ textAlign: "center" }}>Número do Pedido</h3>
                <h2 style={{ border: "1px solid #c2c2c2", padding: "1px", textAlign: "center", fontWeight: "bold", borderRadius: "5px", background: "white" }}>
                  {Math.floor(Math.random() * 100)}
                </h2>

                <div className="row mt-2">
                  <div className="col-lg-3"><b>Aluno</b></div>
                  <div className="col-lg-9">{pessoaSelecionada}</div>
                  <div className="col-lg-3"><b>Item</b></div>
                  <div className="col-lg-9">{produtoSelecionado?.nome}</div>
                </div>
              </Modal.Body>

            </Modal>

            <Tabs
              defaultActiveKey="home"
              id="uncontrolled-tab-example"
              className="d-inline-flex justify-content-center mb-3"
            >
              <Tab eventKey="home" title="Comidas" >
                <div className="row g-4">
                  <p style={{ fontSize: "30px", fontFamily: 'Nunito', fontWeight: 800, color: "#0F172B" }}><FontAwesomeIcon icon={faHamburger} color='orange' size='' /> Comidas</p>


                  {produtos.map((item, idx) => {
                    if (item.tipo == 0) {
                      return (
                        <div className="col-lg-6">
                          <div className="d-flex align-items-center">
                            <img className="flex-shrink-0 img-fluid rounded img-produto" src={`img/${item.image}`} alt="Img produto" />
                            <div className="w-100 d-flex flex-column text-start ps-4">
                              <h5 className="d-flex justify-content-between border-bottom pb-2">
                                <span>{item.nome}</span>
                                <span className="text-primary">R$ {item.preco}</span>
                              </h5>
                              <small className="fst-italic">{item.descricao}</small>
                              <Button variant='warning' onClick={() => btnComprar(idx)}>Comprar</Button>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })}

                </div>
              </Tab>

              <Tab eventKey="profile" title="Bebidas">
                <p style={{ fontSize: "30px", fontFamily: 'Nunito', fontWeight: 800, color: "#0F172B" }}><FontAwesomeIcon icon={faCoffee} color='orange' size='' /> Bebidas</p>

                <div className="row g-4">
                  {produtos.map((item, idx) => {
                    if (item.tipo == 1) {
                      return (
                        <div className="col-lg-6">
                          <div className="d-flex align-items-center">
                            <img className="flex-shrink-0 img-fluid rounded img-produto" src={`img/${item.image}`} alt="Img produto" />
                            <div className="w-100 d-flex flex-column text-start ps-4">
                              <h5 className="d-flex justify-content-between border-bottom pb-2">
                                <span>{item.nome}</span>
                                <span className="text-primary">R$ {item.preco}</span>
                              </h5>
                              <small className="fst-italic">{item.descricao}</small>
                              <Button variant='warning' onClick={() => btnComprar(idx)}>Comprar</Button>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>
              </Tab>
            </Tabs>
          </Container>
        </>
      }
    </div >
  );
}

export default App;
