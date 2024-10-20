import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { StatutPage } from '../statut/statut.page';
import { musicTab } from '../../views/play/play.page';
import { AlbumdetailPage } from '../Albums/albumdetail/albumdetail.page';
import { TopSongsService } from '../../services/top-songs.service';
import { SuggestionsService } from '../../services/suggestions.service';
import { ArtistService } from '../../services/artist.service';
import { GenresService } from '../../services/genres.service';
import { TopAlbumsService } from '../../services/top-albums.service';
import { SongsService } from 'src/app/services/songs.service';
import { HttpClient } from '@angular/common/http';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import {NativeAudio} from '@capacitor-community/native-audio'

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.page.html',
  styleUrls: ['./suggestions.page.scss'],
})
export class SuggestionsPage implements OnInit {
  
  topalbums:any[]=[];
  constructor(
    private media: Media,
    private platform: Platform,
    private http:HttpClient,
    private route: Router,
    private navCtrl: NavController,
    private modal: ModalController,
    private topsService: TopSongsService,
    private suggestionsService: SuggestionsService,
    private artistService: ArtistService,
    private genresService: GenresService,
    private topAlbumsService:TopAlbumsService,
    private router: Router,
    private songService:SongsService
  ) { }

  tabSong = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  isOpenmodalAchat = false;
  walletIsOpen = false;
  confirDeletButtons = [
    {
      text: 'Annuler',
      handler: () => { this.isOpenmodalAchat = false; },
    },
    {
      text: 'Achat',
      handler: () => { this.isOpenmodalAchat = false; this.walletIsOpen = true; },
    }
  ]
  walletButtons = [
    {
      text: 'Annuler',
      handler: () => { this.walletIsOpen = false; },
    },
    {
      text: 'Ajouter un porte monnaie',
      handler: () => { this.walletIsOpen = false; this.navCtrl.navigateForward('/wallet'); },
    },
  ]

  isPlaying: boolean = false;

  playMusic = (item: any) => {
    console.log(item);
    localStorage.setItem('music', JSON.stringify(item));

    musicTab.isClose = false;
    musicTab.musicIsPlay = true;
    console.log('musicTab : ', musicTab);
    const songUrl = item.audio_location;

    if(this.isPlaying){
      NativeAudio.unload({
        assetId: 'fire',
      });
    }

    NativeAudio.preload({
      assetId: 'fire',
      assetPath: songUrl,  
      audioChannelNum: 1,
      isUrl: true
    }).then(() => {
      console.log('Audio préchargé');
      this.isPlaying = true
    }).catch(err => {
      console.log('Erreur lors du préchargement', err);
    });

    NativeAudio.play({
      assetId: 'fire'
    }).then(() => {
      console.log('Lecture en cours');
    }).catch(err => {
      console.log('Erreur lors de la lecture', err);
    });


  }

  // goToSegment(segment: string) {
  //   this.route.navigate(['tabs/home', segment]);
  // }

  goToPlay() {
    this.navCtrl.navigateForward('play');
  }

  async openActut() {
    const modal = await this.modal.create({
      component: StatutPage,
      animated: true,
      showBackdrop: true,
      backdropDismiss: false,

    });

    await modal.present();
  }


  async openAlbumDetail(props:any) {
    const modal = await this.modal.create({
      component: AlbumdetailPage,
      animated: true,
      showBackdrop: true,
      backdropDismiss: false,
    })
    await modal.present();
  }


  openPopup() {
    this.isOpenmodalAchat = true;
  }

  topSongs: any[] = [];
  artists: any[] = [];
  suggestions: any[] = [];
  genres: any[] = [];
  albums:any[]=[];
  songs:any[]=[];
  latest:any[]=[];
  songFile!: MediaObject;


  // playSong(songUrl: string) {
  //   this.platform.ready().then(() => {
  //     this.songFile = this.media.create(songUrl);
  //     this.songFile.play();  
  //   });
  // }

  // stopSong() {
  //   if (this.songFile) {
  //     this.songFile.stop(); 
  //   }
  // }

  // fetchTopSongs() {
  //   const apiUrl = 'https://afrozikbox.com/endpoint/common/discover?server_key=d012ab7a1e170f66e8ed63176dcc4e7b';
  //   this.http.post(apiUrl, {
  //     access_token: 'your-access-token',
  //     server_key: 'your-server-key',
  //     limit: 1,
  //     offset: 0
  //   }).subscribe((data: any) => {
  //     const songUrl = data.new_releases.data[0].audio_location;
  //     console.log("url audio", songUrl);
  //     this.playSong(songUrl);
  //   });
  // }

  ngOnInit() {
    const son = this.songService.fetchTopSongs();
    this.topsService.getTopSongs().subscribe(
      (response) => {
        this.topSongs = response.data;
        // console.log('Meilleur songs récupérés :', this.topSongs);
      },
      (error) => {
        console.error('Erreur lors de la récupération des Meilleur songs :', error);
      }
    );
    this.artistService.getArtists().subscribe(
      (response) => {
        console.log('Artistes récupérés :', response);
        this.artists = response.data.data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des artistes :', error);
      }
    );
    this.suggestionsService.getSuggestions().subscribe(
      (response) => {
        console.log('suggestions récupérés :', response);
        this.albums = response.randoms.album;
        this.songs = response.randoms.song;
        this.latest = response.new_releases.data;
        console.log(this.latest,'latest sonfs');
      },
      (error) => {
        console.error('Erreur lors de la récupération des suggestions :', error);
      }
    );
    this.genresService.getGenre().subscribe(
      (response) => {
        this.genres = response.data;
        console.log('genres récupérés :', this.genres);
      },
      (error) => {
        console.error('Erreur lors de la récupération des genres :', error);
      }
    );
    this.topAlbumsService.getTopAlbums().subscribe(
      (response) => {
        this.topalbums = response.top_albums;
        console.log('meilleurs albums récupérés :', this.topalbums);
      },
      (error) => {
        console.error('Erreur lors de la récupération des meilleurs albums :', error);
      }
    );
  }
  selectGenre(genre: any) {
    localStorage.setItem('selectedGenre', JSON.stringify(genre));
    
    this.router.navigate(['/musicbygenre', genre.id]);
  }

  selectAlbum(album: any) {
    localStorage.setItem('selectedAlbum', JSON.stringify(album));
    
    this.router.navigate(['albumdetail', album.id]);
  }

  goToSegment(segment: string) {
    this.router.navigate([segment]);
  }

}
