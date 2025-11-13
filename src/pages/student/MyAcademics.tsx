import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, TrendingUp, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const MyAcademics = () => {
  const navigate = useNavigate();

  // Mock academic data
  const academicData = {
    currentSemester: "6th Semester",
    cgpa: 8.65,
    attendance: 92,
    creditsCompleted: 145,
    totalCredits: 180,
    semesters: [
      { sem: "Semester 1", sgpa: 8.2, credits: 24 },
      { sem: "Semester 2", sgpa: 8.4, credits: 24 },
      { sem: "Semester 3", sgpa: 8.7, credits: 25 },
      { sem: "Semester 4", sgpa: 8.9, credits: 24 },
      { sem: "Semester 5", sgpa: 8.8, credits: 24 },
      { sem: "Semester 6", sgpa: 8.6, credits: 24 }
    ],
    currentCourses: [
      { code: "CSE401", name: "Machine Learning", credits: 4, grade: "A", attendance: 95 },
      { code: "CSE402", name: "Cloud Computing", credits: 4, grade: "A", attendance: 90 },
      { code: "CSE403", name: "Software Engineering", credits: 3, grade: "A+", attendance: 98 },
      { code: "CSE404", name: "Big Data Analytics", credits: 3, grade: "A", attendance: 88 },
      { code: "CSE405", name: "Cyber Security", credits: 3, grade: "B+", attendance: 92 }
    ],
    achievements: [
      "Dean's List - Semester 4",
      "Best Project Award - Software Engineering",
      "100% Attendance - Semester 3",
      "Top 5% of Class"
    ]
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    return 'text-yellow-500';
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student-portal')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-effect px-6 py-3 rounded-full mb-4 border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Academic Performance</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 hero-text">My Academics</h1>
            <p className="text-lg text-foreground/70">Track your academic progress and performance</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect p-6 border border-primary/20 text-center">
              <div className="text-4xl font-bold text-primary mb-2">{academicData.cgpa}</div>
              <p className="text-sm text-foreground/70">Current CGPA</p>
            </Card>
            <Card className="glass-effect p-6 border border-accent/20 text-center">
              <div className="text-4xl font-bold text-accent mb-2">{academicData.attendance}%</div>
              <p className="text-sm text-foreground/70">Attendance</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{academicData.creditsCompleted}</div>
              <p className="text-sm text-foreground/70">Credits Completed</p>
            </Card>
            <Card className="glass-effect p-6 border border-border/30 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">{academicData.currentSemester}</Badge>
              <p className="text-sm text-foreground/70 mt-2">Current Semester</p>
            </Card>
          </div>

          {/* Current Courses */}
          <Card className="glass-effect p-6 mb-8 border border-border/30">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Current Courses
            </h2>
            <div className="space-y-3">
              {academicData.currentCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="outline">{course.code}</Badge>
                      <h3 className="font-semibold text-foreground">{course.name}</h3>
                    </div>
                    <p className="text-sm text-foreground/60">Credits: {course.credits}</p>
                  </div>
                  <div className="flex gap-8 items-center">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>{course.grade}</div>
                      <p className="text-xs text-foreground/60">Grade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{course.attendance}%</div>
                      <p className="text-xs text-foreground/60">Attendance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Semester Performance */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Semester Performance
              </h2>
              <div className="space-y-3">
                {academicData.semesters.map((sem, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <div>
                      <p className="font-medium text-foreground">{sem.sem}</p>
                      <p className="text-sm text-foreground/60">{sem.credits} Credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{sem.sgpa}</p>
                      <p className="text-xs text-foreground/60">SGPA</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="glass-effect p-6 border border-border/30">
              <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Academic Achievements
              </h2>
              <ul className="space-y-3">
                {academicData.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/70">{achievement}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAcademics;
