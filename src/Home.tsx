import React, { useContext, useEffect, useState } from 'react'
import {
  web3Enable,
  isWeb3Injected,
  web3Accounts,
  web3FromSource
} from '@polkadot/extension-dapp'
import { ApiPromise, Keyring } from '@polkadot/api'
import { Abi, ContractPromise } from '@polkadot/api-contract'
import { NFTStorage, File } from "nft.storage";

import { BN } from '@polkadot/util/bn'
import { formatBalance } from '@polkadot/util';
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'

import { ApiContext } from './context/ApiContext'
import ABI from './artifacts/lunesnft.json'
import { Card, CardContent, FormControl, InputLabel, List, ListItem, MenuItem, Select, TextField, Typography } from '@mui/material'
import Identicon from '@polkadot/react-identicon'

const address: string = process.env.CONTRACT_ADDRESS || '5FtbieGRk3oHDkGqn2t82tJq6GypowQN6CwbhWK5CQEwVBtZ'
const network: string = process.env.NETWORK || 'Lunes'
const NFT_STORE_API_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGE4NjQzRTQ1OTQ5MjIyYURiNjU2NkZBZDZEYUFERjJkMEI5Q0ZDNjQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMzI2MDU1ODYyMCwibmFtZSI6ImRldi1sdW5lcyJ9.ZwhkwSwQys1uTP47LWt5aFhU0_0MXhQ7BPGBzlTz-K0";

function Home() {
  const { api, apiReady } = useContext(ApiContext)
  const [amount, setAmount] = useState<string>('')
  const [id_nft, setId_nft] = useState<string>('')
  const [max_supply, setMax_supply] = useState<string>('')
  const [file_url, setFile_url] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [max_per_mint, setMax_per_mint] = useState<string>('')

  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [account, setAccount] = useState<InjectedAccountWithMeta>()

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [contract, setContract] = useState<ContractPromise>()
  const [balance, setBalance] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [listNFT, setListNFT] = useState([])
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    updateState()
  }, [contract])

  useEffect(() => {
    const getBalance = async () => {
      if (!api || !apiReady || !account) return

      const balance: any = await api.query.system.account(account?.address)

      setBalance(formatBalance(balance.data.free.toBn(), { decimals: 8 }))
    }

    getBalance()
  }, [api, apiReady, account])

  const updateState = () => {
    if (contract) allToken()
    if (contract) myNFT()
  }

  const getGasLimit = (api: ApiPromise) =>
    api.registry.createType(
      'WeightV2',
      api.consts.system.blockWeights['maxBlock']
    )
  //Lista as NFTS
  const allToken = async () => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }

    if (!account) {
      setError('Account not initialized')
      return
    }

    if (!contract) {
      setError('Contract not initialized')
      return
    }
    //Estimativa do gas
    const gasLimit: any = getGasLimit(api)
    const { gasRequired, result, output }: any = await contract.query['payableMintImpl::allToken'](
      account.address,
      {
        gasLimit,
      }, {
      page: "1",
    }
    )
    console.log('gasRequired', gasRequired.toString())
    console.log('result', result)
    console.log('output', output)

    if (result.isErr) {
      setError(result.asErr.toString())
      return
    }

    if (output) {
      const nfts = output.toHuman()
      if (nfts?.Ok.Ok?.length > 0)
        setListNFT(nfts?.Ok.Ok)
      const resl = result.toHuman() as []
      console.log(nfts)

    }
  }
  //detalhes NFT
  const detailsNFT = async () => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }

    if (!account) {
      setError('Account not initialized')
      return
    }

    if (!contract) {
      setError('Contract not initialized')
      return
    }
    ''
    const gasLimit: any = getGasLimit(api)
    const { gasRequired, result, output }: any = await contract.query['payableMintImpl::tokenDetails'](
      account.address,
      {
        gasLimit,
      }, {
      tokenId: "1",
    }
    )
    console.log('gasRequired', gasRequired.toString())
    console.log('result', result)
    console.log('output', output)

    if (result.isErr) {
      setError(result.asErr.toString())
      return
    }

    if (output) {
      const nfts = output.toHuman()
      console.log(nfts)

    }
  }
  //Lista NFT da carteira do usuário
  const myNFT = async () => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }

    if (!account) {
      setError('Account not initialized')
      return
    }

    if (!contract) {
      setError('Contract not initialized')
      return
    }
    ''
    const gasLimit: any = getGasLimit(api)
    const { gasRequired, result, output }: any = await contract.query['payableMintImpl::tokenAccount'](
      account.address,
      {
        gasLimit,
      }, {
      page: "1",
    }
    )
    console.log('gasRequired', gasRequired.toString())
    console.log('result', result)
    console.log('output', output)

    if (result.isErr) {
      setError(result.asErr.toString())
      return
    }

    if (output) {
      const nfts = output.toHuman()
      console.log(nfts)

    }
  }

  //Conecta a carteira
  const connectWalletHandler = async () => {

    setError('')
    setSuccessMsg('')
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }

    const extensions = await web3Enable('Lunes NFT')

    /* check if wallet is installed */
    if (extensions.length === 0) {
      setError('The user does not have any Substrate wallet installed')
      return
    }

    // set the first wallet as the signer (we assume there is only one wallet)
    api.setSigner(extensions[0].signer)

    const injectedAccounts = await web3Accounts()

    if (injectedAccounts.length > 0) {
      setAccounts(injectedAccounts)
      setAccount(injectedAccounts[0])
    }
    conectcontract()
  }
  //inicia o contrato
  const conectcontract = () => {
    setLoading(true)
    const contract = new ContractPromise(api, ABI, address);
    setContract(contract)
    setLoading(false)
  }

  const handleOnSelect = async (event: any) => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return false
    }
    const address: string = event.target.value
    const account = accounts.find(account => account.address === address)
    if (account) {
      setAccount(account)

      const injected = await web3FromSource(account.meta.source)
      api.setSigner(injected.signer)
      conectcontract()
    }
  }
  const handleClose = () => {
    setLoading(false)
  }
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }
  //mint
  const mintNFThandler = async () => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }
    if (!account) {
      setError('Account not initialized')
      return
    }

    if (!contract) {
      setError('Contract not initialized')
      return
    }
    if (!contract) {
      setError('Contract not initialized')
      return
    }
    if (!id_nft) {
      setError('id_nft not initialized')
      return
    }
    if (!amount) {
      setError('amount not initialized')
      return
    }
    const nft = listNFT.find((nft: any) => nft.tokenId == id_nft)
    if (!nft) {
      setError('nft not found')
      return
    }
    const { price } = nft;
    let total_paymenyt = Number(price?.toString().replace(/,/g, '').trim()) * Number(amount)
    console.log(total_paymenyt)
    console.log(id_nft)
    const gasLimit: any = getGasLimit(api)
    //Estimativa do gas 
    const { gasRequired, storageDeposit, result }: any = await contract.query['payableMintImpl::mint'](
      account.address,
      {
        gasLimit,
        storageDepositLimit: 100000000,
        value: total_paymenyt
      },
      id_nft,
      amount
    )
    console.log('gasRequired', gasRequired.toString())
    console.log('storageDeposit', storageDeposit.toHuman())

    if (result.isErr) {
      let error = ''
      if (result.asErr.isModule) {
        const dispatchError = api.registry.findMetaError(result.asErr.asModule)
        console.log('error', dispatchError.name)
        error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
      } else {
        error = result.asErr.toString()
      }

      setError(error)
      return
    }
    if (result.isOk) {
      const flags = result.asOk.flags.toHuman()
      if (flags.includes('Revert')) {
        console.log('Revert')
        console.log(result.toHuman())
        const type = contract.abi.messages[5].returnType
        const typeName = type?.lookupName || type?.type || ''
        const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()

        setError(error ? (error as any).Err : 'Revert')
        return
      }
    }
    //Realiza a transferência WEB3
    setLoading(true)
    await contract.tx['payableMintImpl::mint']({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: total_paymenyt
    },
      id_nft,
      amount)
      .signAndSend(account.address, (res) => {
        if (res.status.isInBlock) {
          console.log('in a block')
        }
        if (res.status.isFinalized) {
          console.log('finalized')
          setLoading(false)
          setAmount("")
          setId_nft("")
          setError("")
          setSuccessMsg('Successfully creted token nft!')
        }
      })

  }
  //Queima de NFT
  const burnHandlerNFT = async () => {
    if (!api || !apiReady) {
      setError('The API is not ready')
      return
    }

    if (!account) {
      setError('Account not initialized')
      return
    }

    if (!contract) {
      setError('Contract not initialized')
      return
    }
    const gasLimit: any = getGasLimit(api)
    const { gasRequired, storageDeposit, result }: any = await contract.query['payableMintImpl::burn'](
      account.address,
      {
        gasLimit,
        storageDepositLimit: 100000000,
      },
      1, // Id do NFT
      1 //Qtd de token      
    )
    console.log('gasRequired', gasRequired.toString())
    console.log('storageDeposit', storageDeposit.toHuman())
    if (result.isErr) {
      let error = ''
      if (result.asErr.isModule) {
        const dispatchError = api.registry.findMetaError(result.asErr.asModule)
        console.log('error', dispatchError.name)
        error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
      } else {
        error = result.asErr.toString()
      }

      setError(error)
      return
    }
    if (result.isOk) {
      const flags = result.asOk.flags.toHuman()
      if (flags.includes('Revert')) {
        console.log('Revert')
        console.log(result.toHuman())
        const type = contract.abi.messages[5].returnType
        const typeName = type?.lookupName || type?.type || ''
        const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()

        setError(error ? (error as any).Err : 'Revert')
        return
      }
      setLoading(true)
      await contract.tx['payableMintImpl::burn']({
        gasLimit: gasRequired,
        storageDepositLimit: null
      },
        1, // Id do NFT
        1 //Qtd de token   
      )
        .signAndSend(account.address, (res) => {
          if (res.status.isInBlock) {
            console.log('in a block')
          }
          if (res.status.isFinalized) {
            console.log('finalized')
            setLoading(false)
            setError("")
            setSuccessMsg('Successfully burn token nft!')
          }
        })

    }
  }
    //Tranferencia NFT
    const transferHandlerNFT = async () => {
      if (!api || !apiReady) {
        setError('The API is not ready')
        return
      }

      if (!account) {
        setError('Account not initialized')
        return
      }

      if (!contract) {
        setError('Contract not initialized')
        return
      }
      const gasLimit: any = getGasLimit(api)
      const { gasRequired, storageDeposit, result }: any = await contract.query['payableMintImpl::transfer'](
        account.address,
        {
          gasLimit,
          storageDepositLimit: 100000000,
        },
        "", // To - endereço para enviar
        1, // Id do NFT
        1 //Qtd de token      
      )
      console.log('gasRequired', gasRequired.toString())
      console.log('storageDeposit', storageDeposit.toHuman())
      if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
          const dispatchError = api.registry.findMetaError(result.asErr.asModule)
          console.log('error', dispatchError.name)
          error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
          error = result.asErr.toString()
        }

        setError(error)
        return
      }
      if (result.isOk) {
        const flags = result.asOk.flags.toHuman()
        if (flags.includes('Revert')) {
          console.log('Revert')
          console.log(result.toHuman())
          const type = contract.abi.messages[5].returnType
          const typeName = type?.lookupName || type?.type || ''
          const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()

          setError(error ? (error as any).Err : 'Revert')
          return
        }
        setLoading(true)
        await contract.tx['payableMintImpl::transfer']({
          gasLimit: gasRequired,
          storageDepositLimit: null
        },
          "", // To - endereço para enviar
          1, // Id do NFT
          1 //Qtd de token   
        )
          .signAndSend(account.address, (res) => {
            if (res.status.isInBlock) {
              console.log('in a block')
            }
            if (res.status.isFinalized) {
              console.log('finalized')
              setLoading(false)
              setError("")
              setSuccessMsg('Successfully transfer token nft!')
            }
          })

      }
    }
    //Salva nova NFT
    const savehandlerNewNFT = async () => {
      if (!api || !apiReady) {
        setError('The API is not ready')
        return
      }

      if (!account) {
        setError('Account not initialized')
        return
      }

      if (!contract) {
        setError('Contract not initialized')
        return
      }
      if (!file) {
        setError('file not initialized')
        return
      }
      let fileipfs = await storeAssetUpload()
      console.log("Aquiv", fileipfs)
      const gasLimit: any = getGasLimit(api)
      const { gasRequired, storageDeposit, result }: any = await contract.query['payableMintImpl::newToken'](
        account.address,
        {
          gasLimit,
          storageDepositLimit: 100000000,
        },
        name,
        symbol,
        fileipfs,
        description,
        max_supply,
        max_per_mint,
        price
      )
      console.log('gasRequired', gasRequired.toString())
      console.log('storageDeposit', storageDeposit.toHuman())

      if (result.isErr) {
        let error = ''
        if (result.asErr.isModule) {
          const dispatchError = api.registry.findMetaError(result.asErr.asModule)
          console.log('error', dispatchError.name)
          error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
        } else {
          error = result.asErr.toString()
        }

        setError(error)
        return
      }
      if (result.isOk) {
        const flags = result.asOk.flags.toHuman()
        if (flags.includes('Revert')) {
          console.log('Revert')
          console.log(result.toHuman())
          const type = contract.abi.messages[5].returnType
          const typeName = type?.lookupName || type?.type || ''
          const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()

          setError(error ? (error as any).Err : 'Revert')
          return
        }
      }

      setLoading(true)
      await contract.tx['payableMintImpl::newToken']({
        gasLimit: gasRequired,
        storageDepositLimit: null
      },
        name,
        symbol,
        fileipfs,
        description,
        max_supply,
        max_per_mint,
        price)
        .signAndSend(account.address, (res) => {
          if (res.status.isInBlock) {
            console.log('in a block')
          }
          if (res.status.isFinalized) {
            console.log('finalized')
            setLoading(false)
            updateState()
            setDescription("")
            setFile_url("")
            setSymbol("")
            setPrice("")
            setMax_per_mint("")
            setMax_supply("")
            setName("")
            setError("")
            setSuccessMsg('Successfully creted token nft!')
          }
        })
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    };
    const storeAssetUpload = async () => {
      if (file){
        const buffer = await file.arrayBuffer();
        const content = new Blob([buffer])
        const client = new NFTStorage({ token: NFT_STORE_API_KEY });
        const metaData = await client.storeBlob(content);      
        return metaData;
      }
      return null;
    };

    return (
      <React.Fragment>
        <Dialog onClose={handleClose} open={loading}>
          <DialogTitle>Confirming Transaction</DialogTitle>
          <Box sx={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Dialog>
        <CssBaseline />
        <Container maxWidth="xl">
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <h1>NFT Lunes</h1>
                <h5>Select an create now.</h5>
              </Grid>
              <Grid item xs={2}>
                {accounts.length === 0
                  ? <Box sx={{ p: 2 }}>
                    <Button onClick={connectWalletHandler} variant="outlined">Connect Wallet</Button>
                  </Box>
                  : <>Address: {account?.address}</>
                }
              </Grid>
              <Grid item xs={6}>
                {accounts.length && account ?
                  <>
                    <Typography>Enter the lottery by sending value</Typography>
                    <FormControl sx={{ 'width': '600px' }}>
                      <InputLabel>Select Account</InputLabel>
                      <Select
                        value={account.address}
                        label="Select Account"
                        onChange={handleOnSelect}
                      >
                        {accounts.map(account => (
                          <MenuItem key={account.address} value={account.address}>
                            <Grid container spacing={2}>
                              <Grid item xs={1}>
                                <Identicon
                                  value={account.address}
                                  theme='polkadot'
                                  size={40}
                                />
                              </Grid>
                              <Grid item xs={11}>
                                <Typography sx={{ fontWeight: 'bold' }}>{account.meta.name}</Typography>
                                <Typography>{account.address}</Typography>
                              </Grid>
                            </Grid>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography>Balance: {balance} {api ? api.registry.chainTokens[0] : null}</Typography>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="name"
                        label="Nome do NTF"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="file"
                        label="File URL IPFS"
                        type='file' onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="symbol"
                        label="Symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="desc"
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="max"
                        label="Maximo de Moedas"
                        value={max_supply}
                        onChange={(e) => setMax_supply(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="min"
                        label="min por mint"
                        value={max_per_mint}
                        onChange={(e) => setMax_per_mint(e.target.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="price"
                        label="Price por min"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </FormControl>
                    <br />
                    <br />
                    <Button variant="contained" onClick={() => savehandlerNewNFT()}>Salvar novo NFT</Button>
                  </>
                  : <>Connect Wallet to Play</>}
              </Grid>

              <Grid item xs={6}>
              {accounts.length && account ?
                <Card sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Miint
                    </Typography>
                    <FormControl sx={{ 'width': '600px' }}>
                      <InputLabel>Select Account</InputLabel>
                      <Select
                        value={account?.address}
                        label="Select Account"
                        onChange={handleOnSelect}
                      >
                        {accounts.map(account => (
                          <MenuItem key={account.address} value={account.address}>
                            <Grid container spacing={2}>
                              <Grid item xs={1}>
                                <Identicon
                                  value={account.address}
                                  theme='polkadot'
                                  size={40}
                                />
                              </Grid>
                              <Grid item xs={11}>
                                <Typography sx={{ fontWeight: 'bold' }}>{account.meta.name}</Typography>
                                <Typography>{account.address}</Typography>
                              </Grid>
                            </Grid>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography>Balance: {balance} {api ? api.registry.chainTokens[0] : null}</Typography>
                    </FormControl>
                    <FormControl sx={{ 'width': '600px' }}>
                      <TextField
                        id="quantidade"
                        error={isNaN(Number(amount))}
                        label="quantidade mint"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </FormControl>
                    <Select
                      value={id_nft}
                      label="Select Account"
                      onChange={(e) => setId_nft(e.target.value)}
                    >
                      {listNFT.map((nft: any) => (
                        <MenuItem key={nft.tokenId} value={nft.tokenId}>
                          <Grid container spacing={2}>
                            <Grid item xs={1}>
                              <img
                                src={`https://cloudflare-ipfs.com/ipfs/${nft.fileUrl}`}
                                width={40}
                              />
                            </Grid>
                            <Grid item xs={11}>
                              <Typography>Symbol:{nft.symbol}-{nft.name} / Price:{nft.price} / Suplly:{nft.maxSupply}</Typography>
                            </Grid>
                          </Grid>
                        </MenuItem>
                      ))}
                    </Select>
                    <br />
                    <br />
                    <Button variant="contained" onClick={() => mintNFThandler()} >Mint</Button>
                  </CardContent>
                </Card>
                :<></>}
              </Grid>
              <Grid item>
                <Typography sx={{ color: 'red' }}>
                  {error}
                </Typography>
              </Grid>
              <Grid item>
                <Typography sx={{ color: 'green' }}>
                  {successMsg}
                </Typography>
              </Grid>
            </Grid>

          </Box>
        </Container>
      </React.Fragment>
    )
  }

  export default Home
