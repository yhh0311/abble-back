import { getBalance, fetchCardsOf } from './api/UseCaver';
import * as KlipAPI from "./api/UseKlip";
import * as KasAPI from "./api/UseKAS";
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './market.css';
import { Alert, Container, Card, Nav, Form, Button, Modal, Row, Col } from 'react-bootstrap';
import { MARKET_CONTRACT_ADDRESS } from './constants';

const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x000000000000000";

function App() {
  // ================================= 변수 =================================

  const [loginState, setLoginState] = useState('LOGGEDOUT'); //LOGGEDIN, LOGGEDOUT

  // ------ Global Data ------ 
  const [nfts, setNfts] = useState([]); //{tokenId:'101', tokenUri:'~~~.png'}
  const [myBalance, setMyBalance] = useState('0');
  const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS); 

  // ------ UI ------ 
  const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);
  const [tab, setTab] = useState('MARKET'); //MARKET, MINT

  const [mintImageUrl, setMintImageUrl] = useState("");
  const [mintTokenID, setMintTokenID] = useState("");
  const [mintMarketAddress, setMintMarketAddress] = useState("");
  const [mintPosX, setMintPosX] = useState("");
  const [mintPosY, setMintPosY] = useState("");

  // ------ Modal ------ 
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "MODAL",
    onConfirm: () => {},
  });

  // ------ Modal(NFT 구매용) ------ 
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftModalProps, setNFTModalProps] = useState({
    onConfirm: () => {},
  });

  const rows = nfts.slice(nfts.length / 2);

  // ================================= 함수 =================================

  // 사용자 정보 초기화
  const initData = () => {
    setQrvalue(DEFAULT_QR_CODE);
    setMyAddress(DEFAULT_ADDRESS);
    setMyBalance('0');
    setLoginState('LOGGEDOUT');
  };

  // getUserData
  const getUserData = () => {
    //로그아웃
    if(loginState === 'LOGGEDIN'){
      initData();
    }
    //로그인
    if(loginState === 'LOGGEDOUT'){
      setModalProps({
        title: "QR코드를 스캔해 Klip 지갑을 연동해주세요"
      });
      setShowModal(true);
      KlipAPI.getAddress(setQrvalue, async (address) => {
        setMyAddress(address);
        const _balance = await getBalance(address);
        setMyBalance(_balance);
        setLoginState('LOGGEDIN');
        setShowModal(false);
      });
    }
  };

  // fetchMarketNFTs
  const fetchMarketNFTs = async () => {
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    setNfts(_nfts);
  };

  // onClickMint
  const onClickMint = async (address, uri, tokenID, posX, posY) => {
    if (address === DEFAULT_ADDRESS) {
      alert("NO ADDRESS");
      return;
    }

    //metadata 업로드 -> uri 받아서 업로드
    const metadataUrl = await KasAPI.uploadMetaData(uri, posX, posY);
    if(!metadataUrl){
      alert('metadata 업로드에 실패하였습니다.');
      return;
    }

    KlipAPI.mintCardWithPosAndURI(
      address,
      tokenID,
      posX,
      posY,
      metadataUrl,
      (result) => {
        alert(JSON.stringify(result));
      }
    );
    
   /*
    KlipAPI.mintCardWithURI(
      myAddress,
      tokenID,
      metadataUrl,
      setQrvalue,
      (result) => {
        alert(JSON.stringify(result));
      }
    );
    */
  };
  
  const onClickCard = (id) => {
    if (tab === "MARKET") {
      setNFTModalProps({
        title: "NFT를 구매하시겠어요?",
        onConfirm: () => {
          onClickMarketItem(id);
        },
      });
      setShowNFTModal(true);
    }
  };

  // onClickMarketItem
  const onClickMarketItem = (tokenId) => {
    KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
      alert(JSON.stringify(result));
    });
  };

  // 시작 시 실행
  useEffect(() => {
    fetchMarketNFTs();
  }, []);


  return (
    <div className="App">
      <div style={ {backgroundColor: "black", padding: 10}}>

        {/* 정보 */}
        <div style={{fontSize: 25, fontWeight: "bold", paddingLeft:5, marginTop:10}}> 
          내 지갑 주소 : 
          {myAddress}
        </div>

        <div style={{fontSize: 25, fontWeight: "bold", paddingLeft:5, marginTop:10}}> 
          내 잔고 : 
          {myAddress !== DEFAULT_ADDRESS
            ? ` ${myBalance} KLAY`
            : " 로그인해주세요"
          }
        </div>
        <br />

        {/* 로그인 */}
        <Button 
          onClick={getUserData}
          variant="primary"
          style={{
            backgroundColor: "green"
          }}
        >
        {myAddress !== DEFAULT_ADDRESS
          ? "로그아웃"
          : "로그인"}
        </Button>{' '}

        <br />
        <br />

        {/* 갤러리(마켓, 내지갑) */}
        {tab === "MARKET" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            {rows.map((o, rowIndex) => (
              <Row key={`rowkey${rowIndex}`}>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  <Card
                    onClick={() => {
                      onClickCard(nfts[rowIndex * 2].id);
                    }}
                  >
                    <Card.Img src={nfts[rowIndex * 2].uri} />
                  </Card>
                  [{nfts[rowIndex * 2].id}]NFT
                </Col>
                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <Card
                      onClick={() => {
                        onClickCard(nfts[rowIndex * 2 + 1].id);
                      }}
                    >
                      <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                    </Card>
                  ) : null}
                  {nfts.length > rowIndex * 2 + 1 ? (
                    <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                  ) : null}
                </Col>
              </Row>
            ))}
          </div>
        ) : null}
        <br />
        <br />

        {/* ----------------- 발행 페이지 ----------------- */}
        {tab === "MINT" ? (
          <div className="container" style={{ padding: 0, width: "100%" }}>
            <Card
              className="text-center"
              style={{ color: "black", height: "50%", borderColor: "#C5B358" }}
            >
              <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                {mintImageUrl !== "" ? (
                  <Card.Img src={mintImageUrl} height={"50%"} />
                ) : null}
                <Form>
                  <Form.Group>
                  <Form.Control
                      value={mintMarketAddress}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintMarketAddress(e.target.value);
                      }}
                      type="text"
                      placeholder="올릴 마켓 주소를 입력해주세요"
                    />
                    <br />
                    <Form.Control
                      value={mintImageUrl}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintImageUrl(e.target.value);
                      }}
                      type="text"
                      placeholder="이미지 주소를 입력해주세요"
                    />
                    <br />
                    <Form.Control
                      value={mintTokenID}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintTokenID(e.target.value);
                      }}
                      type="text"
                      placeholder="토큰 ID를 입력해주세요"
                    />
                    <br />
                    <Form.Control
                      value={mintPosX}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintPosX(e.target.value);
                      }}
                      type="text"
                      placeholder="X 포지션 입력해주세요"
                    />                    
                    <br />
                    <Form.Control
                      value={mintPosY}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setMintPosY(e.target.value);
                      }}
                      type="text"
                      placeholder="Y 포지션 입력해주세요"
                    />                    
                  </Form.Group>                  
                  <br />
                  <Button
                    onClick={() => {
                      onClickMint(mintMarketAddress, mintImageUrl, mintTokenID);
                    }}
                    variant="primary"
                    style={{
                      backgroundColor: "green"
                    }}
                  >
                    발행하기
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        ) : null}
      </div>

      {/* ----------------- 모달(NFT구매 팝업) ----------------- */}
      <Modal centered size="md" show={showNFTModal}  onHide={() => { setShowNFTModal(false); }}>
        <Modal.Header style={{ border: 0, backgroundColor: "black", opacity: 0.8 }} >
          <Modal.Title align="center">NFT를 구매하시겠습니까?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Woohoo, you're reading this text in a modal!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowNFTModal(false); }}>
            취소
          </Button>
          <Button variant="primary" 
            onClick={() => {
              nftModalProps.onConfirm();
              setShowNFTModal(false);
            }}
            style={{ backgroundColor: "#810034", borderColor: "#810034" }}
          >
            구매
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- 모달 ----------------- */}
      <Modal centered size="md" show={showModal} onHide={() => { setShowModal(false); }} >
        <Modal.Header style={{ border: 0, backgroundColor: "black", opacity: 0.8 }} >
          <Modal.Title align="center">{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <br />
          {/* QR코드 뷰어 */}
          {qrvalue !== "DEFAULT" ? (
            <Container style={{ backgroundColor: "white", padding: 20 }} align="center" >
              <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />
              <br />
            </Container>
          ) : null}
          <br />
        </Modal.Body>
        <Modal.Footer  style={{ border: 0, backgroundColor: "black", opacity: 0.8 }} >
          <Button onClick={() => { setShowModal(false); }}> 취소 </Button>
        </Modal.Footer>
      </Modal>

      {/* 탭 (todo: 나중에 UI랑 연결하기) */}
      <nav
        style={{ backgroundColor: "#1b1717", height: 45 }}
        className="navbar fixed-bottom navbar-light"
        role="navigation"
      >
        <Nav className="w-100">
          <div className="d-flex flex-row justify-content-around w-100">
            <div
              onClick={() => {
                setTab('MARKET');
                fetchMarketNFTs();
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                MARKET
              </div>
            </div>
            <div
              onClick={() => {
                setTab('MINT');
              }}
              className="row d-flex flex-column justify-content-center align-items-center"
            >
              <div>
                MINT
              </div>
            </div>
          </div>
        </Nav>
      </nav>
    </div>
  );
}

export default App;
