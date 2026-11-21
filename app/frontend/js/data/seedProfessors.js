/**
 * js/data/seedProfessors.js
 * Sample professors shown before any real professor signs up.
 */

const SEED = [
{id:"s1",name:"Maria Santos",subjects:["Mathematics","Statistics"],dept:"Arts & Sciences",status:"GREEN",bio:"Handles make-up exams for math subjects.",exp:"5 yrs",avail:{days:["Mon","Wed","Fri"],from:"09:00",to:"15:00"},rating:4.8,count:24,phone:"0917 000 0001"},
{id:"s2",name:"James Reyes",subjects:["Programming","Databases"],dept:"IT",status:"YELLOW",bio:"Programming and database exams every Tue/Thu.",exp:"4 yrs",avail:{days:["Tue","Thu"],from:"13:00",to:"17:00"},rating:4.9,count:31,phone:"0917 000 0002"},
{id:"s3",name:"Angela Cruz",subjects:["English"],dept:"Education",status:"RED",bio:"Writing exams by appointment.",exp:"8 yrs",avail:{days:["Mon","Tue","Thu"],from:"15:00",to:"18:00"},rating:4.7,count:52,phone:"0917 000 0003"},
{id:"s4",name:"Paolo Dizon",subjects:["Physics"],dept:"Engineering",status:"GREEN",bio:"Physics lab and lecture make-up exams.",exp:"3 yrs",avail:{days:["Sat","Sun"],from:"09:00",to:"15:00"},rating:4.6,count:12,phone:"0917 000 0004"},
{id:"s5",name:"Liza Ramos",subjects:["Accounting","Networking"],dept:"Business",status:"GREEN",bio:"Business and networking exams.",exp:"6 yrs",avail:{days:["Wed","Fri"],from:"10:00",to:"16:00"},rating:4.8,count:19,phone:"0917 000 0005"}
];

/** Country and age for the sample professors. */
const SEED_PROFILE_EXTRAS = {
    s1: { country: "Philippines", age: 29 },
    s2: { country: "Philippines", age: 27 },
    s3: { country: "Philippines", age: 34 },
    s4: { country: "Philippines", age: 24 },
    s5: { country: "Philippines", age: 38 },
    s6: { country: "Spain", age: 31 },
    s7: { country: "Singapore", age: 30 }
};
SEED.forEach(t => Object.assign(t, SEED_PROFILE_EXTRAS[t.id]));
