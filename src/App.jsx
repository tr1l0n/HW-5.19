import React, { Component, useEffect, useReducer, useState } from 'react'
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
  // state = {
  //   query: '',
  //   totalHits: null,
  //   gallery: [],
  //   page: 1,
  //   error: null,
  //   status: 'idle',
  //   isOpen: false,
  //   selectedImage: null,
  // }
  // componentDidUpdate = async ( prevProps, prevState) => {
  //   if (prevState.query !== this.state.query) {
  //     try {
  //       const resp = await this.handleFetch(this.state.query); 
  //       this.setState({
  //         gallery: resp.hits,
  //         totalHits: resp.totalHits,
  //         status: "resolved",
  //       })
  //     } catch (error) {
  //       this.setState({ error: error.message, status: "rejected" });
  //     }
  //   }
  // }
  useEffect(async () => {
    if (prevState.query !== state.query) {
      try {
        const resp = await handleFetch(state.query); 
        setState(prevState => ({
          ...prevState,
          gallery: resp.hits,
          totalHits: resp.totalHits,
          status: "resolved",
        }))
      } catch (error) {
        setState({ error: error.message, status: "rejected" });
      }
    }
  })
  const handleFetch = async (query) => {
    return await fetchImages(query);
  }
  const handleSearch = async query => {
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
  }
  const handleToggle = () => {
    setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen,
    }));
  }
  const handleOpen = e => {
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
  };
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    try {
      const images = await fetchImages(query, page);
      setState(prevState => ({
        ...prevState,
        gallery: [...gallery, ...images.hits],
        page: nextPage
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error.message,
      }))
    }
  }
  {
    const isAllImageLoaded = state.page === Math.ceil(state.totalHits / 12);
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
                src={selectedImage?.largeImageURL}
                alt={selectedImage?.tags}
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
}