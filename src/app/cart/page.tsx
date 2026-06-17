'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, Package, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const WILAYAS: Record<string, string[]> = {
  '01 - Adrar': ['Adrar', 'Aoulef', 'Aougrout', 'Bordj Badji Mokhtar', 'Charouine', 'Fenoughil', 'In Zghmir', 'Metarfa', 'Ouled Ahmed Timmi', 'Reggane', 'Sali', 'Tamest', 'Timimoun', 'Timokten', 'Tinerkouk', 'Tsabit', 'Zaouiet Kounta'],
  '02 - Chlef': ['Ain Merane', 'Beni Haoua', 'Boukadir', 'Chlef', 'Chettia', 'El Hadjadj', 'El Karimia', 'El Marsa', 'Harchoun', 'Herenfa', 'Labiod Medjadja', 'Moussadek', 'Oued Fodda', 'Oued Goussine', 'Ouled Ben Abdelkader', 'Ouled Fares', 'Sendjass', 'Taougrite', 'Tenes', 'Zeboudja'],
  '03 - Laghouat': ['Aflou', 'Ain Madhi', 'Ain Sidi Ali', 'Brida', 'El Assafia', 'El Ghicha', 'El Houaita', 'Gueltat Sidi Saad', 'Had Sahary', 'Hassi Delaa', 'Hassi R Mel', 'Kheneg', 'Laghouat', 'Oued Morra', 'Oued M Zi', 'Sebgag', 'Sidi Bouzid', 'Sidi Makhlouf', 'Tadjemout', 'Tadjrouna', 'Taouiala'],
  '04 - Oum El Bouaghi': ['Ain Beida', 'Ain Diss', 'Ain Fakroun', 'Ain Kercha', 'Ain Zitoun', 'Behir Chergui', 'Bir Chouhada', 'Dhalaa', 'El Amiria', 'El Belala', 'El Djazia', 'El Fedjouj', 'El Harmilia', 'Fkirina', 'Hanchir Toumghani', 'Ksar Sbahi', 'Meskiana', 'Oued Nini', 'Oum El Bouaghi', 'Rahia', 'Souk Naamane', 'Zorg'],
  '05 - Batna': ['Ain Djasser', 'Ain Touta', 'Arris', 'Azil Abdelkader', 'Barika', 'Batna', 'Boulhilat', 'Boumagueur', 'Bouzina', 'Chir', 'Djerma', 'El Hassi', 'El Madher', 'Fesdis', 'Gosbat', 'Guigba', 'Ichmoul', 'Inoughissen', 'Kimmel', 'Ksar Bellezma', 'Lazrou', 'Lemsane', 'Maafa', 'Menaa', 'Merouana', 'N Gaous', 'Ouled Aouf', 'Ouled Fadel', 'Ouyoun El Assafir', 'Rahbat', 'Ras El Aioun', 'Seggana', 'Seriana', 'Tazoult', 'Theniet El Abed', 'Timgad', 'Tizi N Bechar', 'Tkout'],
  '06 - Bejaia': ['Adekar', 'Akbou', 'Akfadou', 'Amizour', 'Aokas', 'Bejaia', 'Beni Ksila', 'Beni Maouche', 'Boukhlifa', 'Chemini', 'Chellata', 'Darguina', 'Djemaa Sahridj', 'El Kseur', 'Feraoun', 'Ighil Ali', 'Ighram', 'Kherrata', 'Leflaye', 'Melbou', 'Oued Ghir', 'Ouzellaguen', 'Seddouk', 'Sidi Aich', 'Sigus', 'Souk El Tenine', 'Taouzient', 'Taskriout', 'Tifra', 'Tichy', 'Timezrit', 'Tinebdar', 'Toudja'],
  '07 - Biskra': ['Ain Naga', 'Biskra', 'Bordj Ben Azzouz', 'Branis', 'Chetma', 'Doucen', 'El Feidh', 'El Ghrous', 'El Hadjeb', 'El Kantara', 'El Outaya', 'Foughala', 'Lichana', 'Lioua', 'M Chouneche', 'Mcif', 'Meziraa', 'Mkhachkha', 'Oumache', 'Ouled Djellal', 'Ras El Miad', 'Sidi Khaled', 'Sidi Okba', 'Tolga', 'Zeribet El Oued'],
  '08 - Bechar': ['Abadla', 'Beni Ounif', 'Bechar', 'Beni Ikhlef', 'El Ouata', 'Igli', 'Kenadsa', 'Lahmar', 'Meridja', 'Mogheul', 'Oulad Khoudir', 'Taghit', 'Tabelbala', 'Timoudi'],
  '09 - Blida': ['Ain Romana', 'Beni Mered', 'Beni Tamou', 'Blida', 'Bouarfa', 'Boufarik', 'Bougara', 'Bouinan', 'Chebli', 'Chiffa', 'Chrea', 'El Affroun', 'Guerrouaou', 'Hammam Melouane', 'Larba', 'Lodi', 'Meftah', 'Mouzaia', 'Oued Alleug', 'Oued Djer', 'Ouled Selama', 'Soumaa', 'Souhane'],
  '10 - Bouira': ['Ain Bessem', 'Ain El Hadjar', 'Ain Lahdjar', 'Ait Laaziz', 'Bechloul', 'Bir Ghbalou', 'Bordj Okhriss', 'Bouira', 'Chorfa', 'Dechmia', 'Dirrah', 'El Asnam', 'El Hakimia', 'El Khabouzia', 'El Mokrani', 'Guerrouma', 'Haizer', 'Lakhdaria', 'Maala', 'Mezdour', 'M Chedallah', 'Oued El Berdi', 'Ouled Rached', 'Raouraoua', 'Ridane', 'Souk El Khemis', 'Sour El Ghozlane', 'Taghzout', 'Zbarbar'],
  '11 - Tamanrasset': ['Abalessa', 'Foggaret Ez Zoua', 'I N Amenas', 'I N Guezzam', 'I N Salah', 'Tamanrasset', 'Tazrouk', 'Tin Zaouatine'],
  '12 - Tebessa': ['Ain Zerga', 'Bekkaria', 'Bir El Ater', 'Bir Mokkadem', 'Boukhadra', 'Cheria', 'El Aouinet', 'El Houidjbet', 'El Kouif', 'El Ma Labiodh', 'El Meridj', 'El Ogla', 'Ferkane', 'Hammamet', 'Morsott', 'Negrine', 'Ouenza', 'Oum Ali', 'Safsaf El Ouesra', 'Stah Guentis', 'Tebessa', 'Tlidjene'],
  '13 - Tlemcen': ['Ain Fezza', 'Ain Ghoraba', 'Ain Kebira', 'Ain Nehala', 'Ain Tallout', 'Ain Youcef', 'Amieur', 'Azails', 'Bab El Assa', 'Beni Bahdel', 'Beni Mester', 'Beni Ouarsous', 'Beni Snous', 'Bensekrane', 'Bouhlou', 'Chetouane', 'Dar Yaghmouracen', 'El Aricha', 'El Fehoul', 'El Gor', 'Fellaoucene', 'Ghazaouet', 'Hammam Boughrara', 'Hennaya', 'Honaine', 'Maghnia', 'Mansourah', 'Marsa Ben M Hidi', 'Merghem', 'Moulay Slissen', 'Nedroma', 'Ouled Mimoun', 'Oued Chouly', 'Oued Lakhdar', 'Remchi', 'Sabra', 'Sebdou', 'Sidi Abdelli', 'Sidi Djillali', 'Sidi Medjahed', 'Souahlia', 'Souk Tlata', 'Tlemcen'],
  '14 - Tiaret': ['Ain Bouchekif', 'Ain Deheb', 'Ain El Hadid', 'Ain Kermes', 'Ain Thrid', 'Amoura', 'Bougara', 'Chehaida', 'Dahmouni', 'Djillali Ben Amar', 'El Ghomri', 'El Hassi', 'El Idrissia', 'Faidja', 'Frenda', 'Guertoufa', 'Hamadia', 'Ksar Chellala', 'Madna', 'Mahdia', 'Medrissa', 'Meghila', 'Mellakou', 'Mechraa Safa', 'Naima', 'Oued Lili', 'Rahouia', 'Rechaiga', 'Reguia', 'Sebaine', 'Sebt', 'Serghine', 'Si Abdelghani', 'Sidi Abdelghani', 'Sidi Ali Mellal', 'Sidi Bakhti', 'Sougueur', 'Tagdempt', 'Tiaret', 'Tidda', 'Tousnina', 'Zmalet El Emir Abdelkader'],
  '15 - Tizi Ouzou': ['Abi Youcef', 'Ait Aggouacha', 'Ait Aissa Mimoun', 'Ait Boumahdi', 'Ait Chafaa', 'Ait Khelili', 'Ait Mahmoud', 'Ait Oumalou', 'Ait Toudert', 'Ait Yahia', 'Ait Yahia Moussa', 'Ait Zikki', 'Akerrou', 'Assi Youcef', 'Azeffoun', 'Beni Aissi', 'Beni Yenni', 'Beni Zmenzer', 'Boghni', 'Bouzeguen', 'Draa Ben Khedda', 'Draa El Mizan', 'Frikat', 'Ighil Ali', 'Iflissen', 'Ifigha', 'Illilten', 'Imsouhel', 'Imsouhal', 'Larbaa Nath Irathen', 'Maatkas', 'Makouda', 'Mechtras', 'Mekla', 'Mizrana', 'Nait Chabad', 'Ouzera', 'Ouaguenoun', 'Ouadhias', 'Sidi Naamane', 'Souk El Thenine', 'Taddert Ou Fella', 'Tadmait', 'Tala Hamza', 'Tirmitine', 'Tigzirt', 'Timizart', 'Tizi Ghenif', 'Tizi N Tleta', 'Tizi Ouzou', 'Tizi Rached', 'Yahia Ouameur', 'Yatafen', 'Zekri'],
  '16 - Alger': ['Ain Benian', 'Ain Taya', 'Alger Centre', 'Bab El Oued', 'Bab Ezzouar', 'Birkhadem', 'Bir Mourad Rais', 'Bir Touta', 'Birkhadem', 'Bordj El Bahri', 'Bordj El Kiffan', 'Bouzareah', 'Cheraga', 'Dar El Beida', 'Draria', 'El Achour', 'El Biar', 'El Harrach', 'El Magharia', 'El Marsa', 'El Mouradia', 'El Mouradia', 'Hussein Dey', 'Khraicia', 'Kouba', 'Les Eucalyptus', 'Mahelma', 'Mohammadia', 'Oued Smar', 'Ouled Chebel', 'Rahmania', 'Reghaïa', 'Rouiba', 'Sidi Moussa', 'Souidania', 'Staoueli', 'Tessala El Merdja', 'Zeralda'],
  '17 - Djelfa': ['Ain El Ibel', 'Ain Maabed', 'Ain Oussara', 'Amoura', 'Benhar', 'Birine', 'Bouira Lahdab', 'Charef', 'Dar Chioukh', 'Djelfa', 'Douis', 'El Guedid', 'El Idrissia', 'El Khemis', 'Faidh El Botma', 'Had Sahary', 'Hassi Bahbah', 'Hassi El Euch', 'Hassi Fedoul', 'Messaad', 'Moudjebara', 'M Liliha', 'Oum Laadham', 'Sed Rahal', 'Selmana', 'Sidi Baizid', 'Sidi Ladjal', 'Tadmit', 'Zaccar'],
  '18 - Jijel': ['Bordj Tahar', 'Chekfa', 'Djimla', 'El Aouana', 'El Ancer', 'El Milia', 'Emir Abdelkader', 'Erraguene', 'Ghebala', 'Jijel', 'Kaous', 'Oudjana', 'Ouled Rabah', 'Selma Benziada', 'Settara', 'Sidi Abdelaziz', 'Sidi Maarouf', 'Taher', 'Texenna', 'Ziama Mansouriah'],
  '19 - Setif': ['Ain Abessa', 'Ain Arnat', 'Ain Azel', 'Ain Laghroud', 'Ain Oulmene', 'Ain Roua', 'Ain Sebt', 'Ain Trick', 'Amoucha', 'Babor', 'Bazer Sakra', 'Bellaa', 'Beni Aziz', 'Beni Chebana', 'Beni Fouda', 'Beni Hocine', 'Beni Mouhli', 'Beni Ourtilane', 'Bir El Arch', 'Bir Haddada', 'Bougaa', 'Bouandas', 'Boutaleb', 'Dehamcha', 'El Eulma', 'El Ouldja', 'El Ouricia', 'Guellal', 'Guenzet', 'Guergour', 'Hammam Guergour', 'Hammam Sokhna', 'Hamma', 'Harbil', 'Maaouia', 'Maouaou', 'Mezloug', 'Oued El Bared', 'Ouled Addouane', 'Ouled Si Ahmed', 'Ouled Tebben', 'Rasfa', 'Salah Bey', 'Setif', 'Tachouda', 'Talaifacene', 'Taya', 'Tizi N Bechar', 'Zit El Beghal'],
  '20 - Saida': ['Ain El Hadjar', 'Ain Soltane', 'Ain Sekhouna', 'Ain Tidamine', 'Doui Thabet', 'El Hassasna', 'Hounet', 'Maamora', 'Moulay Larbi', 'Ouled Brahim', 'Ouled Khaled', 'Rebahia', 'Saida', 'Sidi Ahmed', 'Sidi Boubekeur', 'Tircine', 'Youb'],
  '21 - Skikda': ['Ain Bouziane', 'Ain Cherchar', 'Ain Kechra', 'Azzaba', 'Ben Azzouz', 'Beni Bechir', 'Beni Zid', 'Bekkouche Lakhdar', 'Bouchtata', 'Cheraia', 'Collo', 'Djendel Saadi Mohamed', 'El Hadaiek', 'El Harrouch', 'Emdjez Edchich', 'Es Sebt', 'Fil Fila', 'Hamadi Krouma', 'Kanoua', 'Kerkera', 'Ouldja Boulbalout', 'Oum Toub', 'Oued Zehour', 'Ramdane Djamel', 'Salah Bouchaour', 'Sidi Mezghiche', 'Skikda', 'Tamalous', 'Zitouna', 'Zerdazas'],
  '22 - Sidi Bel Abbes': ['Ain Adden', 'Ain El Berd', 'Ain Kada', 'Ain Thrid', 'Ain Tindamine', 'Amarnas', 'Badredine El Mokrani', 'Ben Badis', 'Boukhanafis', 'Boudjebaa', 'Chetouane', 'El Hacaiba', 'El Hassel', 'Hassi Zahana', 'Lamtar', 'Marhoum', 'Merine', 'Mezaourou', 'Mezghrane', 'Mostefa Ben Brahim', 'Moulay Slissen', 'Oued Sebaa', 'Oued Taourira', 'Ras El Ma', 'Redjem Demouche', 'Sfisef', 'Sidi Ali Benyoub', 'Sidi Ali Boussidi', 'Sidi Bel Abbes', 'Sidi Brahim', 'Sidi Chaib', 'Sidi Daho Des Zairs', 'Sidi Hamadouche', 'Sidi Khaled', 'Sidi Lahcene', 'Sidi Yacoub', 'Tabia', 'Telagh', 'Tenira', 'Tessala', 'Tilmouni', 'Zeddine'],
  '23 - Annaba': ['Ain Berda', 'Annaba', 'Berrahal', 'Chetaibi', 'Cheurfa', 'El Bouni', 'El Hadjar', 'Eulma', 'Oued El Aneb', 'Seraidi', 'Sidi Amar', 'Treat'],
  '24 - Guelma': ['Ain Ben Beida', 'Ain Larbi', 'Ain Makhlouf', 'Ain Regada', 'Ain Sandel', 'Bellkheir', 'Ben Djarah', 'Beni Mezline', 'Bordj Sabat', 'Bouati Mahmoud', 'Bouchegouf', 'Dahouara', 'El Fedjoudj', 'Guelaat Bou Sbaa', 'Guelma', 'Hammam Debagh', 'Hammam Nbail', 'Heliopolis', 'Houari Boumediene', 'Khezaras', 'Medjez Amar', 'Medjez Sfa', 'Nechmaya', 'Oued Fragha', 'Oued Zenati', 'Ras El Agba', 'Roknia', 'Sellaoua Announa', 'Tamlouka'],
  '25 - Constantine': ['Ain Abid', 'Ain Smara', 'Beni Hamidane', 'Constantine', 'Didouche Mourad', 'El Hamma Bouziane', 'El Khroub', 'Hamma Bouziane', 'Ibn Badis', 'Ibn Ziad', 'Mesaoud Boudjeriou', 'Ouled Rahmoun', 'Zighoud Youcef'],
  '26 - Medea': ['Ain Boucif', 'Ain Ouksir', 'Aissaouia', 'Aziz', 'Baata', 'Berrouaghia', 'Bir Ben Laabed', 'Boghar', 'Bou Aiche', 'Bouaichoune', 'Bouchrahil', 'Boughezoul', 'Bouskene', 'Cheniguel', 'Derrag', 'Djouab', 'El Azizia', 'El Gaada', 'El Hamdania', 'El Omaria', 'El Ouinet', 'Hannacha', 'Kef Lakhdar', 'Khams Djouamaa', 'Ksar El Boukhari', 'Medea', 'Medjebar', 'Meghraoua', 'Mihoub', 'Ouzera', 'Ouled Antar', 'Oued Harbil', 'Rebaia', 'Sedraia', 'Si Mahdjoub', 'Sidi Damed', 'Sidi Errabia', 'Sidi Naamane', 'Sidi Ziane', 'Souagui', 'Tablat', 'Tafraout', 'Thenia', 'Tizi Mahdi', 'Tlatet El Douair', 'Zoubiria'],
  '27 - Mostaganem': ['Achaacha', 'Ain Boudinar', 'Ain Noissi', 'Ain Sidi Cherif', 'Ain Tedles', 'Bouguirat', 'Hadjadj', 'Hassi Mameche', 'Khadra', 'Kheir Eddine', 'Mansourah', 'Mesra', 'Mostaganem', 'Nekmaria', 'Ouled Boughalem', 'Ouled Maalah', 'Safsaf', 'Sidi Ali', 'Sidi Belattar', 'Sidi Lakhdar', 'Sirat', 'Souaflia', 'Stidia', 'Tazgait', 'Touahria'],
  "28 - M'Sila": ["Ain El Hadjel", "Ain El Melh", "Ain Errich", "Ain Fares", "Ain Khadra", "Belaiba", "Ben Srour", "Beni Ilmane", "Bou Saada", "Bouti Tellout", "Chellal", "Dehahna", "El Hamel", "El Houamed", "Hammam Dalaa", "Hammam Essalihine", "Khettouti Sed El Djir", "Khoubana", "Maadid", "Magra", "M'Cif", "M'Sila", "Medjedel", "Mohammed Boudiaf", "Mrara", "Ouanougha", "Ouled Addi Guebala", "Ouled Derradj", "Ouled Madhi", "Ouled Mansour", "Ouled Sidi Ibrahim", "Oulmane", "Oued Char", "Oued Djoual", "Oued El Aneb", "Oued Harreza", "Ras El Oued", "Saled", "Sidi Aissa", "Sidi Ameur", "Sidi M'hamed", "Slim", "Souamaa", "Tarmount", "Zarzour"],
  '29 - Mascara': ['Ain Fares', 'Ain Fekan', 'Ain Frass', 'Ain Itekki', 'Aouf', 'Beniane', 'Bou Hanifia', 'Bouhanifia', 'El Bordj', 'El Gaada', 'El Ghomri', 'El Gueitna', 'El Hachem', 'El Keurt', 'El Menaouer', 'Ferraguig', 'Froha', 'Ghriss', 'Guetna', 'Hachem', 'Khalouia', 'Maoussa', 'Mascara', 'Matemore', 'Mohammadia', 'Nesmoth', 'Oggaz', 'Oued El Abtal', 'Oued Taria', 'Ras El Ain', 'Sidi Abdeldjebar', 'Sidi Kadour', 'Sig', 'Tighennif', 'Tizi', 'Zahana'],
  '30 - Ouargla': ['Ain El Beida', 'Blidet Amor', 'El Borma', 'El Hadjira', 'El Alia', 'Hassi Messaoud', 'Megarine', 'N Goussa', 'Nezla', 'Ouargla', 'Rouissat', 'Sidi Khouiled', 'Taibet', 'Temacine', 'Tebesbest', 'Touggourt', 'Zaouia El Abidia'],
  '31 - Oran': ['Ain El Turk', 'Ain Kerma', 'Arzew', 'Ben Freha', 'Bentehami', 'Bethioua', 'Bir El Djir', 'Bousfer', 'Boutlelis', 'El Ancor', 'El Braya', 'El Kerma', 'Es Senia', 'Gdyel', 'Hassiane Touale', 'Hassi Ben Okba', 'Hassi Mefsoukh', 'Kristel', 'Marsat El Hadjadj', 'Mersa El Hadjadj', 'Misserghin', 'Mers El Hadjadj', 'Oran', 'Oued Tlalat', 'Sidi Benyebka', 'Sidi Chahmi', 'Sfitzen', 'Tafraoui', 'Tessala El Merdja'],
  '32 - El Bayadh': ['Brezina', 'Chellala', 'El Abiodh Sidi Cheikh', 'El Bayadh', 'El Bnoud', 'El Mehara', 'Ghassoul', 'Kef El Ahmar', 'Rogassa', 'Sidi Ameur', 'Sidi Tifour', 'Tousmouline'],
  '33 - Illizi': ['Bordj Omar Driss', 'Djanet', 'I N Amenas', 'Illizi'],
  '34 - Bordj Bou Arreridj': ['Ain Taghrout', 'Ain Tesra', 'Belimour', 'Ben Daoud', 'Bir Kasdali', 'Bordj Bou Arreridj', 'Bordj Ghedir', 'Bordj Zemmoura', 'Colla', 'Djaafra', 'El Anseur', 'El Achir', 'El Hamadia', 'El Main', 'Ghilassa', 'Haraza', 'Hasnaoua', 'Khelil', 'Ksour', 'Mansourah', 'Medjana', 'Ouled Brahem', 'Ouled Dahmane', 'Ouled Sidi Brahim', 'Ras El Oued', 'Rabta', 'Sidi Embarek', 'Tassameurt', 'Teniet En Nasr', 'Tefreg'],
  '35 - Boumerdes': ['Afir', 'Ain Taya', 'Ammal', 'Beni Amrane', 'Boumerdes', 'Boudouaou', 'Boudouaou El Bahri', 'Bougara', 'Bourmane', 'Chaabet El Ameur', 'Chabet El Ameur', 'Corso', 'Dellys', 'Djinet', 'El Kharrouba', 'Hammedi', 'Issers', 'Khemis El Khechna', 'Larbatache', 'Leghata', 'Naciria', 'Ouled Aissa', 'Ouled Heddadj', 'Ouled Moussa', 'Si Mustapha', 'Sidi Daoud', 'Sidi Rached', 'Souk El Had', 'Taourga', 'Thenia', 'Timezrit', 'Zemmouri'],
  '36 - El Tarf': ['Ain El Assel', 'Beni Mehenna', 'Ben Mhidi', 'Besbes', 'Bouhadjar', 'Bouteldja', 'Chebaita Mokhtar', 'Cheffia', 'Drakech', 'El Aioun', 'El Kala', 'El Tarf', 'Hammam Beni Salah', 'Lac Des Oiseaux', 'Oued Zitoun', 'Raml Souk', 'Souarekh', 'Zerizer', 'Zitouna'],
  '37 - Tindouf': ['Tindouf'],
  '38 - Tissemsilt': ['Ain Deheb', 'Ain Rosfa', 'Amari', 'Beni Chaib', 'Beni Lahcene', 'Bordj El Emir Abdelkader', 'Bordj Bou Naama', 'Khemisti', 'Lardjem', 'Lazharia', 'Leksar', 'Maasem', 'Melaab', 'Ouled Bessem', 'Sidi Abed', 'Sidi Boutouchent', 'Sidi Lantri', 'Sidi Slimane', 'Tamalaht', 'Theniet El Had', 'Tissemsilt', 'Youssoufia'],
  '39 - El Oued': ['Bayadha', 'Benziane', 'Bir El Ater', 'Djamaa', 'Douar El Ma', 'El Oued', 'Ghamra', 'Guemmar', 'Hassani Abdelkrim', 'Hassi Khalifa', 'M Ghair', 'Mih Ouansa', 'Mrara', 'Nakhla', 'Oued El Alenda', 'Oum Touyour', 'Rabaa', 'Reguiba', 'Robbah', 'Sidi Aoun', 'Sidi Khaled', 'Sidi Slimane', 'Still', 'Taibet', 'Tendla', 'Trifaoui'],
  '40 - Khenchela': ['Ain Touila', 'Babar', 'Baghai', 'Chechar', 'El Hamma', 'El Mahmel', 'El Oueldja', 'Ensigha', 'Kaiss', 'Khenchela', 'Khirane', 'Mchouneche', 'Ouled Rechache', 'Remila', 'Tamza', 'Yabous'],
  '41 - Souk Ahras': ['Ain Soltane', 'Ain Zana', 'Bir Bouhouche', 'Drea', 'El Eulma', 'Hanancha', 'Khedara', 'Khemissa', 'Lakhdharia', 'M Daourouch', 'Merahna', 'Mechroha', 'Oued Keberit', 'Ouillen', 'Ouled Driss', 'Ouled Moumen', 'Ragouba', 'Safel El Ouidane', 'Sedrata', 'Sidi Fredj', 'Souahlia', 'Souk Ahras', 'Taoura', 'Terreguelt', 'Tidgha', 'Zaarouria'],
  '42 - Tipaza': ['Ahmeur El Ain', 'Ain Tagourait', 'Attatba', 'Beni Milleuk', 'Bouharoun', 'Bou Ismail', 'Cherchell', 'Damous', 'Douaouda', 'El Afroun', 'Fillaoussene', 'Fouka', 'Gouraya', 'Hadjout', 'Khemisti', 'Kolea', 'Larhat', 'Meurad', 'Menaceur', 'Nador', 'Oued El Alleug', 'Sidi Amar', 'Sidi Ghiles', 'Sidi Rached', 'Sidi Semiane', 'Tipaza'],
  '43 - Mila': ['Ahmed Rachedi', 'Ain Beida Harriche', 'Ain Mellouk', 'Ain Tine', 'Amira Arras', 'Benyahia Abderrahmane', 'Bouhatem', 'Chellal', 'Chelghoum Laid', 'Dermoun', 'El Ayadi Barbes', 'El Mechira', 'Eleuled', 'Ferdjioua', 'Grarem Gouga', 'Hamala', 'Mila', 'Oued Athmenia', 'Oued Endja', 'Oued Seguen', 'Ouled Khellouf', 'Rouached', 'Sidi Khelifa', 'Sidi Merouane', 'Tadjenanet', 'Tassadane Haddada', 'Teleghma', 'Terrai Bainen', 'Tessour'],
  '44 - Ain Defla': ['Ain Benian', 'Ain Bouyahia', 'Ain Defla', 'Ain Lechiekh', 'Ain Torki', 'Ain Soltane', 'Arib', 'Barbouche', 'Bathia', 'Belaas', 'Ben Allal', 'Bir Ould Khelifa', 'Bordj Emir Khaled', 'Boumedfaa', 'Djendel', 'El Abadia', 'El Amra', 'El Attaf', 'El Hassania', 'El Maine', 'Hammam Righa', 'Hoceinia', 'Jendel', 'Khemis Miliana', 'Larbaatacha', 'Mekhatria', 'Miliana', 'Oued Chorfa', 'Oued El Djemaa', 'Oued El Berdi', 'Rouina', 'Sidi Lakhdar', 'Tarik Ibn Ziad', 'Tiberkanine', 'Zeddine'],
  '45 - Naama': ['Ain Ben Khelil', 'Ain Sefra', 'Assela', 'Djeniene Bourezg', 'El Biodh', 'Kasdir', 'Makman Ben Amer', 'Mecheria', 'Moghrar', 'Naama', 'Sfissifa', 'Tiout'],
  '46 - Ain Temouchent': ['Aghlal', 'Ain El Arbaa', 'Ain Kihal', 'Ain Larbaa', 'Ain Temouchent', 'Ain Tolba', 'Aoulef Amer', 'Beni Saf', 'Chaabat El Ham', 'Chentouf', 'El Amria', 'El Emir Abdelkader', 'El Malah', 'El Ouataaa', 'Hammam Bouhadjar', 'Hassi El Ghella', 'Mesra', 'Oued Berkeche', 'Oued Sabah', 'Ouled Boudjemaa', 'Ouled Kihal', 'Sidi Ben Adda', 'Sidi Bouzid', 'Sidi Ouriache', 'Sidi Safi', 'Tamzoura', 'Terga'],
  '47 - Ghardaia': ['Berriane', 'Bounoura', 'Dhayet Bendhahoua', 'El Atteuf', 'El Guerrara', 'El Menea', 'Ghardaia', 'Guerrara', 'Hassi El Fehal', 'Hassi Gara', 'Mansourah', 'Metlili', 'Sebseb', 'Zelfana'],
  '48 - Relizane': ['Ain Tarek', 'Ammi Moussa', 'Belassel Bouzegza', 'Beni Dergoun', 'Beni Zentis', 'Djidiouia', 'El Hamadna', 'El Hassi', 'El Matmar', 'El Ouldja', 'Had Echkalla', 'Hamri', 'Lahlef', 'Mazouna', 'Mediouna', 'Mendes', 'Mokhtar', 'Oued El Djemaa', 'Ouarizane', 'Ouled Aiche', 'Ouled Sidi Mihoub', 'Oued Rhiou', 'Ramka', 'Relizane', 'Sidi Khettab', 'Sidi Lazreug', 'Sidi M Hamed Benali', 'Sidi Saada', 'Yellel', 'Zemmora'],
  "49 - El M'Ghair": ["Djamaa", "El M'Ghair", "Megarine", "Merara", "Oued El Alenda", "Oum Touyour", "Reguiba", "Sidi Amrane", "Sidi Slimane", "Still", "Tendla"],
  '50 - El Meniaa': ['El Meniaa', 'Hassi Gara', 'In Tarek'],
  '51 - Ouled Djellal': ['Besbes', 'Chaiba', 'Doucen', 'El Hadjeb', 'El Ouassel', 'Lioua', 'Ouled Djellal', 'Ras El Miad', 'Sidi Khaled'],
  '52 - Bordj Baji Mokhtar': ['Bordj Baji Mokhtar', 'Timiaouine'],
  '53 - Beni Abbes': ['Beni Abbes', 'El Ouata', 'Igli', 'Kerzaz', 'Oulad Khodeir', 'Tamtert', 'Timoudi'],
  '54 - Timimoun': ['Aougrout', 'Charouine', 'Deldoul', 'Fenoughil', 'Metarfa', 'Ouled Said', 'Ouled Aissa', 'Talmine', 'Timimoun', 'Tinerkouk'],
  '55 - Touggourt': ['Benziane', 'Blidet Amor', 'El Hadjira', 'Megarine', 'Nezla', 'Taibet', 'Temacine', 'Tebesbest', 'Touggourt', 'Zaouia El Abidia'],
  '56 - Djanet': ['Bordj El Haoues', 'Djanet'],
  '57 - In Salah': ['Foggaret Ez Zoua', 'I N Guezzam', 'In Salah'],
  '58 - In Guezzam': ['In Guezzam', 'Tin Zaouatine'],
};

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ phone: '', notes: '' });
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [delivery, setDelivery] = useState<'domicile' | 'bureau' | ''>('');
  const [ordering, setOrdering] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const communes = wilaya ? WILAYAS[wilaya] || [] : [];

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned) return 'Téléphone requis';
    if (!/^(05|06|07)\d{8}$/.test(cleaned)) return 'Numéro invalide (ex: 0555123456)';
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setForm(f => ({ ...f, phone: val }));
    setPhoneError(validatePhone(val));
  };

  const handleOrder = async () => {
    if (!user) {
      toast.error('Connectez-vous pour passer une commande');
      router.push('/auth/login');
      return;
    }
    if (!wilaya) return toast.error('Choisissez votre wilaya');
    if (!commune) return toast.error('Choisissez votre commune');
    if (!delivery) return toast.error('Choisissez le mode de livraison');
    const err = validatePhone(form.phone);
    if (err) { setPhoneError(err); toast.error(err); return; }

    const address = `${commune}, ${wilaya} — Livraison ${delivery === 'domicile' ? 'à domicile' : 'en bureau'}`;

    try {
      setOrdering(true);
      await api.post('/api/orders', {
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          color: i.selectedColor || null,
          size: i.selectedSize || null,
        })),
        address,
        phone: form.phone,
        notes: form.notes,
      });
      clearCart();
      toast.success('Commande passée avec succès ! 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <ShoppingCart size={56} className="mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Votre panier est vide</h2>
        <Link href="/products" className="btn-primary inline-block mt-4">Voir les articles</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> Continuer les achats
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon panier</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => {
            const { product, quantity } = item;
            return (
              <div key={`${product.id}-${item.selectedColor}-${item.selectedSize}`} className="card flex gap-4 p-4">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url
                    ? <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    : <div className="flex items-center justify-center h-full"><Package size={24} className="text-gray-400" /></div>}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm">{product.name}</h3>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.selectedColor && <span>🎨 {item.selectedColor}</span>}
                      {item.selectedColor && item.selectedSize && <span> · </span>}
                      {item.selectedSize && <span>📏 {item.selectedSize}</span>}
                    </p>
                  )}
                  <p className="text-pink-600 font-bold mt-1">{(product.price * quantity).toLocaleString('fr-DZ')} DA</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(product.id, quantity - 1, item.selectedColor, item.selectedSize)}
                      className="w-7 h-7 border rounded-full flex items-center justify-center hover:bg-gray-100">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQty(product.id, quantity + 1, item.selectedColor, item.selectedSize)}
                      className="w-7 h-7 border rounded-full flex items-center justify-center hover:bg-gray-100">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(product.id, item.selectedColor, item.selectedSize)}
                      className="ml-auto text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-800 mb-1">Total</h2>
            <div className="text-2xl font-bold text-pink-600 mb-4">{total.toLocaleString('fr-DZ')} DA</div>

            <h3 className="font-medium text-gray-700 mb-3">Informations de livraison</h3>
            <div className="space-y-3">

              {/* Téléphone */}
              <div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className={`input pl-9 ${phoneError ? 'border-red-400' : form.phone.length === 10 ? 'border-green-400' : ''}`}
                    placeholder="Téléphone * (ex: 0555123456)"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">⚠ {phoneError}</p>}
                {!phoneError && form.phone.length === 10 && <p className="text-green-500 text-xs mt-1">✓ Numéro valide</p>}
              </div>

              {/* Wilaya */}
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select className="input pl-9" value={wilaya}
                  onChange={e => { setWilaya(e.target.value); setCommune(''); setDelivery(''); }}>
                  <option value="">-- Choisir la wilaya *</option>
                  {Object.keys(WILAYAS).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              {/* Commune */}
              {wilaya && (
                <select className="input" value={commune}
                  onChange={e => { setCommune(e.target.value); setDelivery(''); }}>
                  <option value="">-- Choisir la commune *</option>
                  {communes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {/* Mode livraison */}
              {commune && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Mode de livraison *</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDelivery('domicile')}
                      className={`border rounded-xl p-3 text-sm text-left transition-all
                        ${delivery === 'domicile' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                      🏠 <span className="font-medium block mt-0.5">Domicile</span>
                    </button>
                    <button onClick={() => setDelivery('bureau')}
                      className={`border rounded-xl p-3 text-sm text-left transition-all
                        ${delivery === 'bureau' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                      🏢 <span className="font-medium block mt-0.5">Bureau</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <textarea className="input resize-none" rows={2} placeholder="Notes (optionnel)"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <button onClick={handleOrder} disabled={ordering} className="btn-primary w-full mt-4 py-3">
              {ordering ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}