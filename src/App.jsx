import React, {  useCallback, useEffect, useMemo,  useState } from 'react'
import './styles.css'
import { SearchBar } from './components/SearchBar'
import { ImageGallery } from './components/ImageGallery'
import { Button } from './components/Button'
import { ImageGalleryItem } from './components/ImageGalleryItem'
import { fetchImages } from './services/galleryResp'
import Modal from './components/Modal'
import { Loader } from './components/Loader'
export function App() {
  const [state, setState] = useState({
      query: '',
      totalHits: null,
      gallery: [],
      page: 1,
      error: null,
      status: 'idle',
      isOpen: false,
      selectedImage: null,
  });
  useEffect(() => {
    if (!state.query) return;
    let isActive = true;
    const loadImages = async () => {
      try {
        const resp = await fetchImages(state.query);
        if (!isActive) return;
         setState(prevState => ({
        ...prevState,
        gallery: resp.hits,
        totalHits: resp.totalHits,
        status: 'resolved',
        error: null,
      }));
      } catch (error) {
          if (!isActive) return;

          setState((prevState) => ({
            ...prevState,
            error: error.message,
            status: "rejected",
          }));
      }
    }
    loadImages();
    return () => {
      isActive = false;
    }
  },[state.query])
  const handleSearch = useCallback(async query => {
    if (query === state.query) {
      alert('введи новий запит');
      return;
    }
    setState(prevState => ({
      ...prevState,
      status: "pending",
      query,
      page: 1
    }))
  }, [state.query]);
  const handleToggle = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen,
    }));
  }, []);
  const handleOpen = useCallback(e => {
    const image = e.target.closest('.imageGalleryItem-image');
    if (!image) return;
    const selectedImage = state.gallery.find(
      item => item.id === Number(image.dataset.id)
    );
    if (!selectedImage) return;
    setState(prevState => ({
      ...prevState,
      isOpen: true,
      selectedImage,
    }));
  },[state.gallery]);
  const handleLoadMore =useCallback(async () => {
    const nextPage = state.page + 1;
    try {
      setState(prevState => ({
        ...prevState,
        status:'pending',
      }))
      const images = await fetchImages(state.query, nextPage);
      setState(prevState => ({
        ...prevState,
        gallery: [...prevState.gallery, ...images.hits],
        page: nextPage,
        status:"resolved",
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error.message,
        status:"rejected",
      }))
    }
  },[state.page,state.query])
  const isAllImageLoaded = useMemo(() => {
    if (state.totalHits === null) return;
    return state.page >= Math.ceil(state.totalHits / 12);
  },[state.page,state.totalHits]);
    if (state.status === "pending") {
      return (
        <div className='loader'>
          <Loader />
        </div>
      );
    }
    if (state.status === "resolved" && state.gallery.length === 0) {
      return (
        <div>
          <SearchBar onSubmit={handleSearch} />
          <h1>Картинок за таким запитом немає,введіть інший запит,будь ласка</h1>
        </div>
      );
    }
    if (state.status === "resolved") {
      return (
        <div>
          <SearchBar onSubmit={handleSearch} />
          <ImageGallery gallery={state.gallery} onClick={handleOpen} />
          {!isAllImageLoaded && (
            <Button onLoad={handleLoadMore} />
          )}
          {state.isOpen && (
            <Modal onClose={handleToggle}>
              <img
                className="modal"
                src={state.selectedImage?.largeImageURL}
                alt={state.selectedImage?.tags}
              />
            </Modal>
          )}
        </div>
      );
    }
    if (state.status === "rejected") {
      return (
        <div>
          <SearchBar onSubmit={handleSearch} />
          {/* // <h1>Помилка запиту,введіть дійсний запит</h1> */}
          <h1>{state.error}</h1>
        </div>
      )
    }
    if (state.status === "idle") {
      return (
        <div>
          <SearchBar onSubmit={handleSearch} />
          <h1>Введіть назву картинок</h1>
        </div>
      );
    }
  }