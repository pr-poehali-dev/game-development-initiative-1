import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Room {
  id: string;
  name: string;
  description: string;
  riddle: Riddle;
  connections: string[];
  emoji: string;
  solved: boolean;
}

interface Riddle {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  rooms: number;
}

const riddles: Riddle[] = [
  {
    id: 1,
    question: "Стоит на месте, но показывает время. Что это?",
    options: ["Солнце", "Часы", "Календарь", "Тень"],
    correctAnswer: 1,
    points: 100
  },
  {
    id: 2,
    question: "Что становится влажным, когда сушит?",
    options: ["Вода", "Полотенце", "Ветер", "Огонь"],
    correctAnswer: 1,
    points: 150
  },
  {
    id: 3,
    question: "Имеет рот, но не говорит. Имеет ложе, но не спит. Что это?",
    options: ["Пещера", "Река", "Дорога", "Гора"],
    correctAnswer: 1,
    points: 200
  },
  {
    id: 4,
    question: "Чем больше из неё берёшь, тем больше она становится?",
    options: ["Яма", "Дыра", "Пустота", "Тень"],
    correctAnswer: 0,
    points: 250
  },
  {
    id: 5,
    question: "Всегда голодный, всё пожирает. Коснётся воды - умирает?",
    options: ["Вулкан", "Огонь", "Дракон", "Молния"],
    correctAnswer: 1,
    points: 300
  }
];

const createRooms = (): Room[] => [
  {
    id: 'entrance',
    name: 'Главный Зал',
    description: 'Огромный зал с высокими потолками. Факелы освещают древние гобелены на стенах.',
    riddle: riddles[0],
    connections: ['library', 'armory'],
    emoji: '🏰',
    solved: false
  },
  {
    id: 'library',
    name: 'Библиотека',
    description: 'Пыльные книги заполняют полки от пола до потолка. Пахнет старой бумагой.',
    riddle: riddles[1],
    connections: ['entrance', 'tower'],
    emoji: '📚',
    solved: false
  },
  {
    id: 'armory',
    name: 'Оружейная',
    description: 'Стены увешаны мечами и щитами. Доспехи стоят словно стражи.',
    riddle: riddles[2],
    connections: ['entrance', 'dungeon'],
    emoji: '⚔️',
    solved: false
  },
  {
    id: 'tower',
    name: 'Башня Мага',
    description: 'Магические руны светятся на полу. В воздухе витает энергия древних заклинаний.',
    riddle: riddles[3],
    connections: ['library', 'treasure'],
    emoji: '🔮',
    solved: false
  },
  {
    id: 'dungeon',
    name: 'Подземелье',
    description: 'Холодно и сыро. Капли воды падают со сводов. Где-то скрипят цепи.',
    riddle: riddles[4],
    connections: ['armory', 'treasure'],
    emoji: '⛓️',
    solved: false
  },
  {
    id: 'treasure',
    name: 'Сокровищница',
    description: 'Блеск золота и драгоценностей ослепляет глаза. Ты нашёл главное сокровище замка!',
    riddle: { id: 6, question: '', options: [], correctAnswer: 0, points: 500 },
    connections: ['tower', 'dungeon'],
    emoji: '💎',
    solved: false
  }
];

const initialAchievements: Achievement[] = [
  { id: 'first', title: 'Первые шаги', description: 'Войди в замок', unlocked: false, icon: 'Castle' },
  { id: 'explorer', title: 'Исследователь', description: 'Посети 3 комнаты', unlocked: false, icon: 'Map' },
  { id: 'complete', title: 'Властелин замка', description: 'Найди сокровищницу', unlocked: false, icon: 'Trophy' },
  { id: 'perfect', title: 'Мудрец', description: 'Реши все загадки без ошибок', unlocked: false, icon: 'Award' }
];

const leaderboardData: LeaderboardEntry[] = [
  { name: "Великий Маг", score: 1500, rooms: 6 },
  { name: "Рыцарь", score: 1200, rooms: 6 },
  { name: "Искатель", score: 1000, rooms: 5 },
  { name: "Странник", score: 750, rooms: 4 },
  { name: "Новичок", score: 500, rooms: 3 }
];

type Screen = 'menu' | 'game' | 'achievements' | 'leaderboard' | 'rules';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [rooms, setRooms] = useState<Room[]>(createRooms());
  const [currentRoomId, setCurrentRoomId] = useState('entrance');
  const [visitedRooms, setVisitedRooms] = useState<string[]>(['entrance']);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [perfectRun, setPerfectRun] = useState(true);

  const currentRoom = rooms.find(r => r.id === currentRoomId)!;

  useEffect(() => {
    if (visitedRooms.length === 1) {
      unlockAchievement('first');
    }
    if (visitedRooms.length === 3) {
      unlockAchievement('explorer');
    }
    if (currentRoomId === 'treasure') {
      unlockAchievement('complete');
      if (perfectRun) {
        unlockAchievement('perfect');
      }
    }
  }, [visitedRooms, currentRoomId, perfectRun]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => 
      a.id === id ? { ...a, unlocked: true } : a
    ));
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult || currentRoom.solved) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentRoom.riddle.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + currentRoom.riddle.points);
      setStreak(prev => prev + 1);
      setRooms(prev => prev.map(r => 
        r.id === currentRoomId ? { ...r, solved: true } : r
      ));
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setPerfectRun(false);
      
      if (lives - 1 <= 0) {
        setGameOver(true);
      }
    }
  };

  const moveToRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    if (!visitedRooms.includes(roomId)) {
      setVisitedRooms(prev => [...prev, roomId]);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const resetGame = () => {
    setRooms(createRooms());
    setCurrentRoomId('entrance');
    setVisitedRooms(['entrance']);
    setScore(0);
    setLives(3);
    setStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setPerfectRun(true);
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-card border-4 border-primary">
        <div className="text-center space-y-8">
          <h1 className="font-pixel text-2xl md:text-4xl text-primary animate-blink">
            🏰 ЗАМОК ЗАГАДОК
          </h1>
          <div className="space-y-4">
            <Button 
              onClick={() => setScreen('game')}
              className="w-full font-pixel text-sm md:text-base h-14 bg-primary hover:bg-primary/80 text-primary-foreground border-2 border-primary-foreground"
            >
              <Icon name="Play" className="mr-2" size={20} />
              НАЧАТЬ ИГРУ
            </Button>
            <Button 
              onClick={() => setScreen('achievements')}
              className="w-full font-pixel text-sm md:text-base h-14 bg-secondary hover:bg-secondary/80 text-secondary-foreground border-2 border-secondary-foreground"
            >
              <Icon name="Trophy" className="mr-2" size={20} />
              ДОСТИЖЕНИЯ
            </Button>
            <Button 
              onClick={() => setScreen('leaderboard')}
              className="w-full font-pixel text-sm md:text-base h-14 bg-accent hover:bg-accent/80 text-accent-foreground border-2 border-accent-foreground"
            >
              <Icon name="Medal" className="mr-2" size={20} />
              ЛИДЕРЫ
            </Button>
            <Button 
              onClick={() => setScreen('rules')}
              className="w-full font-pixel text-sm md:text-base h-14 bg-muted hover:bg-muted/80 text-muted-foreground border-2 border-muted-foreground"
            >
              <Icon name="BookOpen" className="mr-2" size={20} />
              ПРАВИЛА
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderGame = () => {
    if (gameOver) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8 bg-card border-4 border-primary">
            <div className="text-center space-y-6">
              <h2 className="font-pixel text-2xl md:text-3xl text-primary">
                {lives > 0 ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ'}
              </h2>
              <div className="space-y-4">
                <div className="font-pixel text-lg text-foreground">
                  СЧЕТ: {score}
                </div>
                <div className="font-pixel text-sm text-muted-foreground">
                  КОМНАТ ПОСЕЩЕНО: {visitedRooms.length}/{rooms.length}
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    resetGame();
                  }}
                  className="flex-1 font-pixel text-sm h-12 bg-primary hover:bg-primary/80"
                >
                  ЕЩЕ РАЗ
                </Button>
                <Button 
                  onClick={() => {
                    resetGame();
                    setScreen('menu');
                  }}
                  className="flex-1 font-pixel text-sm h-12 bg-secondary hover:bg-secondary/80"
                >
                  МЕНЮ
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6 py-8">
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setScreen('menu')}
              className="font-pixel text-xs bg-muted hover:bg-muted/80"
            >
              <Icon name="ArrowLeft" className="mr-2" size={16} />
              МЕНЮ
            </Button>
            <div className="flex gap-4 items-center font-pixel text-xs">
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Icon 
                    key={i} 
                    name="Heart" 
                    className={i < lives ? 'text-destructive' : 'text-muted'}
                    size={20}
                  />
                ))}
              </div>
              <div className="text-primary">СЧЕТ: {score}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6 bg-card border-4 border-primary">
              <div className="space-y-4">
                <div className="relative bg-muted/20 border-2 border-muted p-8 mb-4 min-h-32">
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-float">{currentRoom.emoji}</div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl animate-walk">
                      🧙‍♂️
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="font-pixel text-lg text-primary">{currentRoom.name}</h2>
                  <p className="font-pixel text-xs text-muted-foreground mt-2 leading-relaxed">
                    {currentRoom.description}
                  </p>
                </div>

                {currentRoom.id !== 'treasure' && !currentRoom.solved && (
                  <>
                    <div className="border-t-2 border-muted pt-4">
                      <Badge className="font-pixel text-xs bg-accent mb-4">
                        +{currentRoom.riddle.points} ОЧКОВ
                      </Badge>
                      <h3 className="font-pixel text-sm text-foreground leading-relaxed mb-4">
                        {currentRoom.riddle.question}
                      </h3>
                      <div className="grid gap-3">
                        {currentRoom.riddle.options.map((option, index) => {
                          let buttonClass = "w-full font-pixel text-xs h-auto py-3 px-4 border-2 ";
                          
                          if (showResult) {
                            if (index === currentRoom.riddle.correctAnswer) {
                              buttonClass += "bg-secondary/30 border-secondary text-secondary-foreground";
                            } else if (index === selectedAnswer) {
                              buttonClass += "bg-destructive/30 border-destructive text-destructive-foreground";
                            } else {
                              buttonClass += "bg-muted/30 border-muted text-muted-foreground";
                            }
                          } else {
                            buttonClass += "bg-primary hover:bg-primary/80 border-primary-foreground text-primary-foreground";
                          }

                          return (
                            <Button
                              key={index}
                              onClick={() => handleAnswer(index)}
                              disabled={showResult}
                              className={buttonClass}
                            >
                              {option}
                            </Button>
                          );
                        })}
                      </div>

                      {showResult && (
                        <div className="text-center mt-4 animate-pixelate">
                          <p className={`font-pixel text-sm ${isCorrect ? 'text-secondary' : 'text-destructive'}`}>
                            {isCorrect ? '✓ ПРАВИЛЬНО!' : '✗ НЕВЕРНО!'}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {currentRoom.solved && (
                  <div className="border-t-2 border-secondary pt-4">
                    <div className="text-center">
                      <Icon name="Check" className="mx-auto text-secondary mb-2" size={32} />
                      <p className="font-pixel text-xs text-secondary">ЗАГАДКА РЕШЕНА</p>
                    </div>
                  </div>
                )}

                {currentRoom.id === 'treasure' && (
                  <div className="border-t-2 border-accent pt-4">
                    <div className="text-center space-y-4">
                      <div className="text-6xl animate-blink">💎</div>
                      <p className="font-pixel text-sm text-accent">ТЫ НАШЁЛ СОКРОВИЩЕ!</p>
                      <p className="font-pixel text-xs text-muted-foreground">+500 ОЧКОВ</p>
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-muted pt-4">
                  <p className="font-pixel text-xs text-muted-foreground mb-3">КУДА ПОЙТИ:</p>
                  <div className="grid gap-2">
                    {currentRoom.connections.map(connId => {
                      const connRoom = rooms.find(r => r.id === connId)!;
                      return (
                        <Button
                          key={connId}
                          onClick={() => moveToRoom(connId)}
                          className="w-full font-pixel text-xs h-auto py-3 px-4 bg-muted hover:bg-muted/80 border-2 border-muted-foreground"
                        >
                          <span className="mr-2">{connRoom.emoji}</span>
                          {connRoom.name}
                          {connRoom.solved && <span className="ml-2 text-secondary">✓</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4 bg-card border-4 border-secondary">
                <h3 className="font-pixel text-xs text-secondary mb-3">КАРТА ЗАМКА</h3>
                <div className="grid grid-cols-2 gap-2 relative">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => moveToRoom(room.id)}
                      disabled={!visitedRooms.includes(room.id) && !currentRoom.connections.includes(room.id)}
                      className={`p-3 border-2 font-pixel text-xs transition-all relative ${
                        room.id === currentRoomId 
                          ? 'border-primary bg-primary/20 scale-105' 
                          : visitedRooms.includes(room.id)
                          ? 'border-muted bg-muted/20 hover:bg-muted/40'
                          : 'border-muted/30 bg-muted/10 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl mb-1">{room.emoji}</div>
                      <div className="text-[8px] leading-tight">{room.name}</div>
                      {room.solved && <div className="text-secondary text-xs mt-1">✓</div>}
                      {room.id === currentRoomId && (
                        <div className="absolute -top-2 -right-2 text-2xl animate-walk">
                          🧙‍♂️
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-card border-4 border-accent">
                <h3 className="font-pixel text-xs text-accent mb-3">СТАТИСТИКА</h3>
                <div className="space-y-2 font-pixel text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Посещено:</span>
                    <span className="text-foreground">{visitedRooms.length}/{rooms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Решено:</span>
                    <span className="text-foreground">{rooms.filter(r => r.solved).length}/{rooms.length - 1}</span>
                  </div>
                  <Progress value={(rooms.filter(r => r.solved).length / (rooms.length - 1)) * 100} className="h-2 mt-2" />
                </div>
              </Card>

              {streak > 0 && (
                <Card className="p-4 bg-accent/20 border-4 border-accent">
                  <div className="text-center">
                    <Icon name="Flame" className="mx-auto text-accent mb-2 animate-blink" size={24} />
                    <p className="font-pixel text-xs text-accent">СЕРИЯ: {streak}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievements = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Button 
          onClick={() => setScreen('menu')}
          className="font-pixel text-xs bg-muted hover:bg-muted/80"
        >
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          НАЗАД
        </Button>

        <h2 className="font-pixel text-2xl text-primary text-center">ДОСТИЖЕНИЯ</h2>

        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`p-6 border-4 transition-all ${
                achievement.unlocked 
                  ? 'border-primary bg-card animate-pixelate' 
                  : 'border-muted bg-muted/20 opacity-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded ${achievement.unlocked ? 'bg-primary' : 'bg-muted'}`}>
                  <Icon 
                    name={achievement.icon as any} 
                    size={24} 
                    className={achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-sm text-foreground mb-2">
                    {achievement.title}
                  </h3>
                  <p className="font-pixel text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <Icon name="Check" className="text-secondary" size={24} />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Button 
          onClick={() => setScreen('menu')}
          className="font-pixel text-xs bg-muted hover:bg-muted/80"
        >
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          НАЗАД
        </Button>

        <h2 className="font-pixel text-2xl text-primary text-center">ТАБЛИЦА ЛИДЕРОВ</h2>

        <Card className="p-6 bg-card border-4 border-primary">
          <div className="space-y-3">
            {leaderboardData.map((entry, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-muted/30 border-2 border-muted"
              >
                <div className={`font-pixel text-2xl w-12 text-center ${
                  index === 0 ? 'text-accent' : 
                  index === 1 ? 'text-secondary' : 
                  index === 2 ? 'text-primary' : 
                  'text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-pixel text-sm text-foreground">{entry.name}</div>
                  <div className="font-pixel text-xs text-muted-foreground">
                    КОМНАТ: {entry.rooms}
                  </div>
                </div>
                <div className="font-pixel text-lg text-primary">
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {score > 0 && (
          <Card className="p-6 bg-secondary/20 border-4 border-secondary">
            <div className="text-center space-y-2">
              <p className="font-pixel text-xs text-muted-foreground">ВАШ СЧЕТ</p>
              <p className="font-pixel text-3xl text-secondary">{score}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Button 
          onClick={() => setScreen('menu')}
          className="font-pixel text-xs bg-muted hover:bg-muted/80"
        >
          <Icon name="ArrowLeft" className="mr-2" size={16} />
          НАЗАД
        </Button>

        <h2 className="font-pixel text-2xl text-primary text-center">ПРАВИЛА ИГРЫ</h2>

        <Card className="p-6 bg-card border-4 border-primary space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <Icon name="Target" className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">ЦЕЛЬ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  Исследуй замок, реши загадки и найди сокровищницу
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Icon name="Map" className="text-secondary mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">ПЕРЕМЕЩЕНИЕ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  Ходи между комнатами замка. Карта покажет твой путь
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Icon name="Brain" className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">ЗАГАДКИ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  В каждой комнате ждёт загадка. Реши её правильно!
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Icon name="Heart" className="text-destructive mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">ЖИЗНИ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  У тебя есть 3 жизни. Неверный ответ = -1 жизнь
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-accent/20 border-4 border-accent">
          <div className="text-center space-y-2">
            <div className="text-4xl">🏰</div>
            <p className="font-pixel text-xs text-foreground">
              СОВЕТ: ИСПОЛЬЗУЙ КАРТУ ДЛЯ БЫСТРОГО ПЕРЕМЕЩЕНИЯ
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {screen === 'menu' && renderMenu()}
      {screen === 'game' && renderGame()}
      {screen === 'achievements' && renderAchievements()}
      {screen === 'leaderboard' && renderLeaderboard()}
      {screen === 'rules' && renderRules()}
    </>
  );
}