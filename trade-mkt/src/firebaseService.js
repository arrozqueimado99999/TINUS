import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

import { firebaseConfig } from './firebase.js'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const secondaryApp = getApps().find(app => app.name === 'createUserApp') || initializeApp(firebaseConfig, 'createUserApp')
const secondaryAuth = getAuth(secondaryApp)

export function authListener(onChange) {
  return onAuthStateChanged(auth, user => onChange(user))
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function signOutUser() {
  await signOut(auth)
}

export async function signUp(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function createAuthUser(email, password) {
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
  await signOut(secondaryAuth)
  return userCredential.user
}

export async function getUserProfile(uid, email = null) {
  if (uid) {
    const ref = doc(db, 'usuarios', uid)
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
  }

  if (email) {
    const normalizedEmail = email.trim().toLowerCase()
    const q = query(collection(db, 'usuarios'), where('email', '==', normalizedEmail))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const firstUser = snapshot.docs[0]
      return { id: firstUser.id, ...firstUser.data() }
    }
  }

  return null
}

export async function listUsers() {
  const snapshot = await getDocs(collection(db, 'usuarios'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function createUserProfile(data, uid) {
  const email = data.email?.trim().toLowerCase()
  const senha = data.senha ?? data.password
  let authUid = uid || null

  if (!authUid && email && senha) {
    try {
      const createdUser = await createAuthUser(email, senha)
      authUid = createdUser.uid
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está em uso.')
      }
      throw error
    }
  }

  const perfil = {
    ...data,
    email,
    criadoPor: auth.currentUser?.uid || null,
    criadoEm: serverTimestamp(),
  }

  if (authUid) {
    const ref = doc(db, 'usuarios', authUid)
    await setDoc(ref, perfil, { merge: true })
    return authUid
  }

  const ref = await addDoc(collection(db, 'usuarios'), perfil)
  return ref.id
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'usuarios', uid)
  await updateDoc(ref, data)
}

export async function deleteUserProfile(uid) {
  const ref = doc(db, 'usuarios', uid)
  await deleteDoc(ref)
}

const demandasCollection = collection(db, 'demandas')
const gruposCollection = collection(db, 'grupos')

export async function listDemandas() {
  const q = query(demandasCollection, orderBy('criadoEm', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getDemanda(demandaId) {
  const snapshot = await getDoc(doc(db, 'demandas', demandaId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createDemanda(data) {
  const ref = await addDoc(demandasCollection, {
    ...data,
    criadoPor: auth.currentUser?.uid || null,
    criadoEm: serverTimestamp(),
  })
  return ref.id
}

export async function updateDemanda(demandaId, data) {
  await updateDoc(doc(db, 'demandas', demandaId), {
    ...data,
    atualizadoEm: serverTimestamp(),
  })
}

export async function deleteDemanda(demandaId) {
  await deleteDoc(doc(db, 'demandas', demandaId))
}

export async function listGrupos() {
  const snapshot = await getDocs(gruposCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function createGrupo(data) {
  const ref = await addDoc(gruposCollection, {
    ...data,
    criadoPor: auth.currentUser?.uid || null,
    criadoEm: serverTimestamp(),
  })
  return ref.id
}

export async function updateGrupo(grupoId, data) {
  await updateDoc(doc(db, 'grupos', grupoId), data)
}

export async function deleteGrupo(grupoId) {
  await deleteDoc(doc(db, 'grupos', grupoId))
}

export async function addComentario(demandaId, comentario) {
  const ref = collection(db, 'demandas', demandaId, 'comentarios')
  await addDoc(ref, {
    ...comentario,
    criadoEm: serverTimestamp(),
    autorId: auth.currentUser?.uid || null,
  })
}

export async function listComentarios(demandaId) {
  const snapshot = await getDocs(collection(db, 'demandas', demandaId, 'comentarios'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function addHistorico(demandaId, evento) {
  const ref = collection(db, 'demandas', demandaId, 'historico')
  await addDoc(ref, {
    ...evento,
    criadoEm: serverTimestamp(),
  })
}

export default {
  auth,
  db,
}
