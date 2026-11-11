/* ==========================================================================
   Javier's New Home — shared data
   Tracks, truths, and little constants used across the site.
   To add a song: drop the mp3 in /Musics, then add a line to JH.tracks.
   To remove one: delete the line. Update d (duration in seconds) if you know it.
   ========================================================================== */

window.JH = window.JH || {};

/* Cover palettes — each track gets one, in order. [from, to] */
window.JH.palettes = [
  ['#2b46f5', '#f0388c'], // cobalt -> magenta
  ['#f0388c', '#f5c542'], // magenta -> yellow
  ['#17150f', '#2b46f5'], // ink -> cobalt
  ['#f5c542', '#2b46f5'], // yellow -> cobalt
  ['#2f7d4e', '#f5c542'], // green -> yellow
  ['#7a3cf0', '#ff7a45'], // violet -> orange
  ['#0f8b8d', '#f2ecdf'], // teal -> paper
  ['#e04747', '#f5c542'], // red -> yellow
  ['#2b46f5', '#7bdff2'], // cobalt -> sky
  ['#f0388c', '#2b46f5']  // magenta -> cobalt
];

/* The archive. f = filename, t = title, a = artist, d = seconds, c = cover palette */
window.JH.tracks = [
  { f: '7_Years_Old.mp3',                     t: '7 Years Old',                    a: 'Lukas Graham',                         d: 272, c: 0 },
  { f: 'All I Need.mp3',                      t: 'All I Need',                     a: 'Jake Bugg',                            d: 216, c: 1 },
  { f: 'Arcade.mp3',                          t: 'Arcade',                         a: 'Duncan Laurence',                      d: 184, c: 2 },
  { f: 'Baby.mp3',                            t: 'Baby',                           a: 'Justin Bieber ft. Ludacris',           d: 219, c: 3 },
  { f: 'Believer.mp3',                        t: 'Believer',                       a: 'Imagine Dragons',                      d: 204, c: 4 },
  { f: 'Blue_Whale_Theme.mp3',                t: 'Blue Whale Theme',               a: 'From the archive',                     d: 250, c: 5 },
  { f: 'Bye Bye Bye.mp3',                     t: 'Bye Bye Bye',                    a: '*NSYNC',                               d: 202, c: 6 },
  { f: 'Changes.mp3',                         t: 'Changes',                        a: 'XXXTENTACION',                         d: 136, c: 7 },
  { f: 'Come in fly with me.mp3',             t: 'Come Fly With Me',               a: 'From the archive',                     d: 194, c: 8 },
  { f: 'Cupid.mp3',                           t: 'Cupid',                          a: 'FIFTY FIFTY',                          d: 169, c: 9 },
  { f: 'dead eyes.mp3',                       t: 'Dead Eyes',                      a: 'Powfu & Ouse',                         d: 219, c: 0 },
  { f: 'dead to me.mp3',                      t: 'Dead to Me',                     a: 'From the archive',                     d: 269, c: 1 },
  { f: 'death bed.mp3',                       t: 'Death Bed',                      a: 'Powfu ft. beabadoobee',                d: 179, c: 2 },
  { f: 'Dusk Till Dawn.mp3',                  t: 'Dusk Till Dawn',                 a: 'ZAYN & Sia',                           d: 235, c: 3 },
  { f: 'Fame.mp3',                            t: 'Fame',                           a: 'Rema',                                 d: 111, c: 4 },
  { f: 'Fantasy.mp3',                         t: 'Fantasy',                        a: 'Mariah Carey',                         d: 250, c: 5 },
  { f: 'Fast Ava.mp3',                        t: 'Fast Ava',                       a: 'FAMY',                                 d: 182, c: 6 },
  { f: 'Get Back Up.mp3',                     t: 'Get Back Up',                    a: 'G-Eazy',                               d: 216, c: 7 },
  { f: 'Get You The Moon.mp3',                t: 'Get You the Moon',               a: 'Kina ft. Snøw',                        d: 183, c: 8 },
  { f: 'Heat Waves.mp3',                      t: 'Heat Waves',                     a: 'Glass Animals',                        d: 204, c: 9 },
  { f: 'Hislerim.mp3',                        t: 'Hislerim',                       a: 'Serhat Durmus ft. Zerrin',             d: 214, c: 0 },
  { f: 'Hit The Road Jack.mp3',               t: 'Hit the Road Jack',              a: 'Drill remix',                          d: 161, c: 1 },
  { f: 'Hoodie.mp3',                          t: 'Hoodie',                         a: 'Hey Violet',                           d: 199, c: 2 },
  { f: 'Hurts So Good.mp3',                   t: 'Hurts So Good',                  a: 'Astrid S',                             d: 206, c: 3 },
  { f: 'I Am A RiDeR.mp3',                    t: 'I Am a Rider',                   a: 'From the archive',                     d: 185, c: 4 },
  { f: 'I See the Light.mp3',                 t: 'I See the Light',                a: 'Mandy Moore & Zachary Levi',           d: 224, c: 5 },
  { f: 'If We Ever Broke Up.mp3',             t: 'If We Ever Broke Up',            a: 'Mae Stephens',                         d: 142, c: 6 },
  { f: 'Infinity.mp3',                        t: 'Infinity',                       a: 'Jaymes Young',                         d: 240, c: 7 },
  { f: 'Knife_In_My_Heart.mp3',               t: 'Knife in My Heart',              a: 'Kina & darkpassengerxx',               d: 164, c: 8 },
  { f: 'kyOresu-Lalala.mp3',                  t: 'Lalala',                         a: 'kyOresu',                              d: 161, c: 9 },
  { f: 'La la la.mp3',                        t: 'La La La',                       a: 'Naughty Boy & Sam Smith',              d: 217, c: 0 },
  { f: 'Legends Never Die.mp3',               t: 'Legends Never Die',              a: 'League of Legends',                    d: 166, c: 1 },
  { f: 'Life Goes On.mp3',                    t: 'Life Goes On',                   a: 'Oliver Tree',                          d: 206, c: 2 },
  { f: 'lovely.mp3',                          t: 'Lovely',                         a: 'Billie Eilish & Khalid',               d: 200, c: 3 },
  { f: 'Middle of the Night.mp3',             t: 'Middle of the Night',            a: 'Elley Duhé',                           d: 182, c: 4 },
  { f: 'Mr. Lonely.mp3',                      t: 'Mr. Lonely',                     a: 'Bobby Vinton',                         d: 163, c: 5 },
  { f: 'Mujhe_Peene_Do_.mp3',                 t: 'Mujhe Peene Do',                 a: 'Darshan Raval',                        d: 183, c: 6 },
  { f: 'Nandemonaiya.mp3',                    t: 'Nandemonaiya',                   a: 'RADWIMPS',                             d: 342, c: 7 },
  { f: 'On My Way.mp3',                       t: 'On My Way',                      a: 'Alan Walker, Sabrina Carpenter & Farruko', d: 216, c: 8 },
  { f: 'One.mp3',                             t: 'One',                            a: 'Lukish Yadav',                         d: 210, c: 9 },
  { f: 'Past Lives.mp3',                      t: 'Past Lives',                     a: 'sapientdream',                         d: 153, c: 0 },
  { f: 'Patlamaya Devam.mp3',                 t: 'Patlamaya Devam',                a: 'Isyan Tetick',                         d: 152, c: 1 },
  { f: 'Price Tag.mp3',                       t: 'Price Tag',                      a: 'Pop Mage',                             d: 127, c: 2 },
  { f: 'Riding Free.mp3',                     t: 'Riding Free',                    a: 'Maisy Stella',                         d: 187, c: 3 },
  { f: 'Rise Up.mp3',                         t: 'Rise Up',                        a: 'TheFatRat',                            d: 169, c: 4 },
  { f: 'ROCKSTAR SKAM BOYS.mp3',              t: 'Rockstar',                       a: 'Skam Boys',                            d: 195, c: 5 },
  { f: 'Royalty.mp3',                         t: 'Royalty',                        a: 'Egzod & Maestro Chives ft. Neoni',     d: 224, c: 6 },
  { f: 'Runaway.mp3',                         t: 'Runaway',                        a: 'AURORA',                               d: 249, c: 7 },
  { f: 'Savage Love.mp3',                     t: 'Savage Love',                    a: 'Jason Derulo & Jawsh 685',             d: 172, c: 8 },
  { f: 'See You Again.mp3',                   t: 'See You Again',                  a: 'Wiz Khalifa ft. Charlie Puth',         d: 237, c: 9 },
  { f: 'Set_Fire_to_The_Rain.mp3',            t: 'Set Fire to the Rain',           a: 'Adele',                                d: 284, c: 0 },
  { f: 'Somebody That I Used To Know.mp3',    t: 'Somebody That I Used to Know',   a: 'Gotye ft. Kimbra',                     d: 244, c: 1 },
  { f: 'Somewhere Only We Know.mp3',          t: 'Somewhere Only We Know',         a: 'Keane',                                d: 236, c: 2 },
  { f: 'Sparkle.mp3',                         t: 'Sparkle',                        a: 'RADWIMPS',                             d: 411, c: 3 },
  { f: 'Still in Love.mp3',                   t: 'Still in Love',                  a: 'Lukish Yadav',                         d: 175, c: 4 },
  { f: 'Sunflower.mp3',                       t: 'Sunflower',                      a: 'Post Malone & Swae Lee',               d: 161, c: 5 },
  { f: 'Sunrise ☀️.mp3',                       t: 'Sunrise',                        a: 'LJ',                                   d: 220, c: 6 },
  { f: 'Taki Taki new Hitler.mp3',            t: 'Taki Taki',                      a: 'DJ Snake ft. Selena Gomez, Ozuna & Cardi B', d: 212, c: 7 },
  { f: 'The Night Begins to Shine.mp3',       t: 'The Night Begins to Shine',      a: 'B.E.R.',                               d: 210, c: 8 },
  { f: 'TU HAI KAHAN.mp3',                    t: 'Tu Hai Kahan',                   a: 'AUR',                                  d: 312, c: 9 },
  { f: 'Wannabe.mp3',                         t: 'Wannabe',                        a: 'why mona',                             d: 217, c: 0 },
  { f: 'We Are.mp3',                          t: 'We Are',                         a: 'Jo Cohen & Sex Whales',                d: 237, c: 1 },
  { f: 'Without Me.mp3',                      t: 'Without Me',                     a: 'Halsey',                               d: 236, c: 2 },
  { f: '【imase】逃避行.mp3',                    t: '逃避行 (Escape)',                  a: 'imase',                                d: 192, c: 3 },
];

/* Truths that rotate on the home + notebook pages. */
window.JH.truths = [
  { q: 'Whatever can be done in under five minutes should be done now.', k: 'THE FIVE-MINUTE RULE' },
  { q: 'Don’t wait for the perfect time. Do it now.', k: 'ON STARTING' },
  { q: 'You will never have enough time if you say yes to everything.', k: 'ON SAYING NO' },
  { q: 'Take responsibility for your mistakes.', k: 'ON OWNERSHIP' },
  { q: 'A lot of bad things happened to me, and I’m happy now that they happened. They changed the trajectory of my life.', k: 'ON PERSPECTIVE' },
  { q: 'People’s minds are changed through observation.', k: 'ON SEEING' },
  { q: 'Don’t be a perfectionist when perfection isn’t required.', k: 'ON FINISHING' },
  { q: 'Do the task you hate first.', k: 'ON HARD THINGS' }
];

/* Staff picks for the home page. Filenames must match JH.tracks. */
window.JH.staffPicks = [
  'Past Lives.mp3',
  'Sparkle.mp3',
  '【imase】逃避行.mp3',
  'Heat Waves.mp3',
  'Dusk Till Dawn.mp3'
];

window.JH.librarySeconds = window.JH.tracks.reduce(function (total, track) { return total + (track.d || 0); }, 0);

