import React from 'react'
import UserinputContainer from './UserinputContainer';
import Playlist from './Playlist';
import { syncData, addSongToPlaylist, sortSongs, toggleLoading, removeSong } from "./actions"
import { connect } from "react-redux"

class Container extends React.Component {

    addSongToPlaylist = (songObject) => {
        if (songObject.title !== "" && songObject.artist !== "" && songObject.genre !== "Select a genre") {
            this.props.dispatch(addSongToPlaylist(songObject))
        }
    }

    addSongToDatabase = async (songObject) => {

        if (songObject.title !== "" && songObject.artist !== "" && songObject.genre !== "Select a genre") {
            try {
                await fetch("https://react-playlist-4dfb9.firebaseio.com/playlist.json", { method: 'POST', body: JSON.stringify(songObject) })
                this.refreshData();
            } catch (error) {
                console.log(error)
            }
        }
    }

    sortPlaylist = (property, direction) => {
        if (direction === "asc") {
            const sortedSongsArray = this.props.songs.sort((a, b) => (a[property] > b[property]) ? 1 : -1)
            this.props.dispatch(sortSongs(sortedSongsArray))
        } else {
            const sortedSongsArray = this.props.songs.sort((a, b) => (a[property] > b[property]) ? -1 : 1)
            this.props.dispatch(sortSongs(sortedSongsArray))
        }
    }

    refreshData = async () => {
        fetch("https://react-playlist-4dfb9.firebaseio.com/playlist.json", { method: "GET" })
            .then(response => response.json())
            .then(data =>
                this.cleanUpData(data))
    }

    cleanUpData = (data) => {
        if (data) {
            let songs = Object.keys(data).map(key => ({
                id: key,
                artist: data[key].artist,
                genre: data[key].genre,
                rating: data[key].rating,
                title: data[key].title
            }));
            this.syncStateToDatabase(songs);
        } else {
            let songs = [{
                id: "",
                artist: "",
                genre: "",
                title: "Start by adding your first song",
                rating: 3
            }]
            this.syncStateToDatabase(songs);
        }
    }

    syncStateToDatabase = (data) => {
        this.props.dispatch(toggleLoading())
        this.props.dispatch(syncData(data))
    }

    removeSongFromPlaylist = (songArray) => {
        const newArray = this.props.songs.filter(song => {
            if (!songArray.includes(song.id)) {
                return song
            }
        })
        this.props.dispatch(removeSong(newArray))
    }

    removeSongFromDatabase = (songArray) => {
        songArray.forEach(song => {
            fetch(`https://react-playlist-4dfb9.firebaseio.com/playlist/${song}.json`, { method: 'DELETE' })
        })
    }

    clearPlaylistHandler = () => {
        const songsToRemove = this.props.songs.map(song => {
            return song.id;
        })
        this.removeSongFromPlaylist(songsToRemove);
        this.removeSongFromDatabase(songsToRemove);
    }

    componentDidMount() {
        this.refreshData();
        this.props.dispatch(toggleLoading())
    }

    render() {
        return (
            <div className="backgroundcontainer">
                <div className="maincontainer">
                    <UserinputContainer
                        addSongToPlaylist={this.addSongToPlaylist}
                        sortPlaylist={this.sortPlaylist}
                        addSongToDatabase={this.addSongToDatabase}
                    />
                    <Playlist
                        removeSongFromDatabase={this.removeSongFromDatabase}
                        removeSongFromPlaylist={this.removeSongFromPlaylist}
                        refreshData={this.refreshData}
                        clearPlaylistHandler={this.clearPlaylistHandler}
                    />
                </div>
            </div >
        )
    }
}

const mapStateToProps = state => ({
    songs: state.songManager.songs,
});

export default connect(mapStateToProps)(Container)