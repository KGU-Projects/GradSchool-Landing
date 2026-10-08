import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteProvider } from './SiteContext.jsx'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Members from './pages/Members.jsx'
import Board from './pages/Board.jsx'
import PostView from './pages/PostView.jsx'
import PostForm from './pages/PostForm.jsx'
import Admin from './admin/Admin.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="members" element={<Members />} />
            <Route path="board" element={<Board />} />
            <Route path="board/write" element={<PostForm />} />
            <Route path="board/:id" element={<PostView />} />
            <Route path="board/:id/edit" element={<PostForm />} />
            <Route path="admin/*" element={<Admin />} />
            <Route path="*" element={<div className="inner page"><h1 className="pageTitle font-inter">404</h1><p>페이지를 찾을 수 없습니다.</p></div>} />
          </Route>
        </Routes>
      </SiteProvider>
    </BrowserRouter>
  )
}
