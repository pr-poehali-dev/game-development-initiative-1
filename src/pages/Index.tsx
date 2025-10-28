import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  level: number;
}

const riddles: Riddle[] = [
  {
    id: 1,
    question: "Что можно увидеть с закрытыми глазами?",
    options: ["Сны", "Темноту", "Звезды", "Будущее"],
    correctAnswer: 0,
    points: 100
  },
  {
    id: 2,
    question: "Что становится влажным, когда сушит?",
    options: ["Вода", "Полотенце", "Ветер", "Солнце"],
    correctAnswer: 1,
    points: 150
  },
  {
    id: 3,
    question: "Что идет, не двигаясь с места?",
    options: ["Облака", "Время", "Река", "Дорога"],
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
    question: "Что может путешествовать по миру, оставаясь в углу?",
    options: ["Паук", "Пыль", "Марка", "Тень"],
    correctAnswer: 2,
    points: 300
  }
];

const initialAchievements: Achievement[] = [
  { id: 'first', title: 'Первый шаг', description: 'Ответь на первую загадку', unlocked: false, icon: 'Star' },
  { id: 'streak3', title: 'На разогреве', description: 'Правильно ответь на 3 загадки подряд', unlocked: false, icon: 'Flame' },
  { id: 'complete', title: 'Мастер загадок', description: 'Пройди все загадки', unlocked: false, icon: 'Trophy' },
  { id: 'perfect', title: 'Безупречность', description: 'Ответь на все загадки с первого раза', unlocked: false, icon: 'Award' }
];

const leaderboardData: LeaderboardEntry[] = [
  { name: "Мастер", score: 1500, level: 5 },
  { name: "Эксперт", score: 1200, level: 5 },
  { name: "Профи", score: 1000, level: 4 },
  { name: "Новичок", score: 750, level: 3 },
  { name: "Игрок", score: 500, level: 2 }
];

type Screen = 'menu' | 'game' | 'achievements' | 'leaderboard' | 'rules';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentRiddle, setCurrentRiddle] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [perfectRun, setPerfectRun] = useState(true);

  useEffect(() => {
    if (streak === 1) {
      unlockAchievement('first');
    }
    if (streak === 3) {
      unlockAchievement('streak3');
    }
  }, [streak]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => 
      a.id === id ? { ...a, unlocked: true } : a
    ));
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === riddles[currentRiddle].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + riddles[currentRiddle].points);
      setStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setPerfectRun(false);
      
      if (lives - 1 <= 0) {
        setGameOver(true);
      }
    }
  };

  const nextRiddle = () => {
    if (currentRiddle + 1 < riddles.length) {
      setCurrentRiddle(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      unlockAchievement('complete');
      if (perfectRun) {
        unlockAchievement('perfect');
      }
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setCurrentRiddle(0);
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
            КВЕСТ ЗАГАДОК
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
                {lives > 0 ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА'}
              </h2>
              <div className="space-y-4">
                <div className="font-pixel text-lg text-foreground">
                  СЧЕТ: {score}
                </div>
                <div className="font-pixel text-sm text-muted-foreground">
                  ЗАГАДОК РЕШЕНО: {currentRiddle + 1}/{riddles.length}
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

    const riddle = riddles[currentRiddle];
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-6 py-8">
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

          <Card className="p-6 bg-card border-4 border-primary">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className="font-pixel text-xs bg-secondary">
                  ЗАГАДКА {currentRiddle + 1}/{riddles.length}
                </Badge>
                <Badge className="font-pixel text-xs bg-accent">
                  +{riddle.points} ОЧКОВ
                </Badge>
              </div>
              
              <Progress value={((currentRiddle + 1) / riddles.length) * 100} className="h-2" />
              
              <h3 className="font-pixel text-sm md:text-base text-foreground leading-relaxed min-h-24 flex items-center">
                {riddle.question}
              </h3>

              <div className="grid gap-3">
                {riddle.options.map((option, index) => {
                  let buttonClass = "w-full font-pixel text-xs md:text-sm h-auto py-4 px-4 border-2 ";
                  
                  if (showResult) {
                    if (index === riddle.correctAnswer) {
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
                <div className="text-center space-y-4 animate-pixelate">
                  <p className={`font-pixel text-sm ${isCorrect ? 'text-secondary' : 'text-destructive'}`}>
                    {isCorrect ? '✓ ПРАВИЛЬНО!' : '✗ НЕВЕРНО!'}
                  </p>
                  <Button 
                    onClick={nextRiddle}
                    className="font-pixel text-sm bg-primary hover:bg-primary/80 h-12"
                  >
                    {currentRiddle + 1 < riddles.length ? 'СЛЕДУЮЩАЯ ЗАГАДКА' : 'ЗАВЕРШИТЬ'}
                    <Icon name="ArrowRight" className="ml-2" size={16} />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {streak > 0 && (
            <div className="text-center">
              <Badge className="font-pixel text-xs bg-accent animate-blink">
                <Icon name="Flame" className="mr-1" size={12} />
                СЕРИЯ: {streak}
              </Badge>
            </div>
          )}
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
                    УРОВЕНЬ {entry.level}
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
                  Отгадай все загадки и набери максимум очков
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

            <div className="flex gap-4 items-start">
              <Icon name="Flame" className="text-accent mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">СЕРИЯ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  Отвечай правильно подряд для серии побед
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Icon name="Trophy" className="text-secondary mt-1" size={24} />
              <div>
                <h3 className="font-pixel text-sm text-foreground mb-2">ДОСТИЖЕНИЯ</h3>
                <p className="font-pixel text-xs text-muted-foreground leading-relaxed">
                  Открывай новые достижения за особые успехи
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-accent/20 border-4 border-accent">
          <div className="text-center space-y-2">
            <Icon name="Zap" className="text-accent mx-auto" size={32} />
            <p className="font-pixel text-xs text-foreground">
              СОВЕТ: ЗА КАЖДУЮ ЗАГАДКУ ДАЮТ РАЗНОЕ КОЛИЧЕСТВО ОЧКОВ
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