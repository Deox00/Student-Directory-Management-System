/* student_cli.c
   CLI DSA tool with string roll numbers
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Student {
    char roll[50];      // CHANGED to string
    char name[100];
    char dept[50];
    float cgpa;
    struct Student *next;
} Student;

Student* head = NULL;

Student* createNode(const char *roll, const char *name, const char *dept, float cgpa) {
    Student *p = malloc(sizeof(Student));
    strncpy(p->roll, roll, sizeof(p->roll)-1); p->roll[sizeof(p->roll)-1]=0;
    strncpy(p->name, name, sizeof(p->name)-1); p->name[sizeof(p->name)-1]=0;
    strncpy(p->dept, dept, sizeof(p->dept)-1); p->dept[sizeof(p->dept)-1]=0;
    p->cgpa = cgpa;
    p->next = NULL;
    return p;
}

void insertEnd(Student *node) {
    if (!head) { head = node; return; }
    Student *t = head;
    while (t->next) t = t->next;
    t->next = node;
}

Student* search(const char *roll) {
    Student *t = head;
    while (t) {
        if (strcmp(t->roll, roll) == 0)
            return t;
        t = t->next;
    }
    return NULL;
}

int deleteRoll(const char *roll) {
    Student *t = head, *prev = NULL;
    while (t) {
        if (strcmp(t->roll, roll) == 0) {
            if (prev) prev->next = t->next;
            else head = t->next;
            free(t);
            return 1;
        }
        prev = t;
        t = t->next;
    }
    return 0;
}

void displayAll() {
    Student *t = head;
    printf("Roll\t\t\tName\t\tDept\tCGPA\n");
    while (t) {
        printf("%s\t%s\t%s\t%.2f\n", t->roll, t->name, t->dept, t->cgpa);
        t = t->next;
    }
}

void saveFile(const char *fn) {
    FILE *f = fopen(fn, "w");
    if (!f) { perror("save"); return; }
    Student *t = head;
    while (t) {
        fprintf(f, "%s,%s,%s,%.2f\n", t->roll, t->name, t->dept, t->cgpa);
        t = t->next;
    }
    fclose(f);
}

void loadFile(const char *fn) {
    FILE *f = fopen(fn, "r");
    if (!f) return;
    char line[256];
    while (fgets(line, sizeof(line), f)) {
        char roll[50], name[100], dept[50];
        float cgpa;

        char *p = strchr(line, '\n');
        if (p) *p = 0;
        if (strlen(line) == 0) continue;

        char *a = strtok(line, ",");
        char *b = strtok(NULL, ",");
        char *c = strtok(NULL, ",");
        char *d = strtok(NULL, ",");

        if (!a || !b || !c || !d) continue;

        strcpy(roll, a);
        strcpy(name, b);
        strcpy(dept, c);
        cgpa = atof(d);

        insertEnd(createNode(roll, name, dept, cgpa));
    }
    fclose(f);
}

void freeAll() {
    Student *t = head;
    while (t) { Student *n = t->next; free(t); t = n; }
}

int main(int argc, char **argv) {
    char filename[128] = "students.csv";
    if (argc >= 2)
        strncpy(filename, argv[1], sizeof(filename)-1);

    loadFile(filename);

    int choice = 0;
    char roll[50], name[100], dept[50];
    float cgpa;

    while (1) {
        printf("\n1:Add 2:Search 3:Delete 4:Display 5:Save 6:Exit\nChoice: ");
        scanf("%d", &choice);

        if (choice == 1) {
            printf("roll name dept cgpa:\n");
            scanf("%s %s %s %f", roll, name, dept, &cgpa);

            if (search(roll)) {
                printf("duplicate roll\n");
                continue;
            }
            insertEnd(createNode(roll, name, dept, cgpa));
        }
        else if (choice == 2) {
            printf("enter roll: ");
            scanf("%s", roll);
            Student *s = search(roll);
            if (s) printf("%s %s %s %.2f\n", s->roll, s->name, s->dept, s->cgpa);
            else printf("not found\n");
        }
        else if (choice == 3) {
            printf("enter roll: ");
            scanf("%s", roll);
            if (deleteRoll(roll))
                printf("deleted\n");
            else
                printf("not found\n");
        }
        else if (choice == 4) {
            displayAll();
        }
        else if (choice == 5) {
            saveFile(filename);
            printf("saved %s\n", filename);
        }
        else break;
    }

    saveFile(filename);
    freeAll();
    return 0;
}
