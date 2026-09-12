# Session and Body Record Discussion
Date: 2026-09-12
Status: Raw source
Source: user-supplied Otter transcript. Speaker labels and transcription errors are retained.

Speaker 1  0:03
So so so I I

Speaker 2  0:04
shock any other mentions you once here

Speaker 1  0:06
yeah I know I know that that that's kind of what I'm thinking I I I think that exercise planning stuff this would be a natural home for it but I also kind of think that for keeping the scopes small, if we go like super focused on, this is basically showing a visualization of your your body, your body scores, and how your body is improving and stuff. So it's like a a tracker, visualization and tracker over time, and the inputs come from the coach and from the agent and and all the rest, and then and then you're like all all of the existing ways that like plans and stuff are set can continue offline. This is basically the what's the it's a digital twin, right? It's a digital twin of my body. Yeah,

Speaker 2  0:53
it's a digital digital twin. It's a digital

Speaker 1  0:55
twin, and I'm seeing how it is reacting to recovery and stuff over time, and the inputs that inform the digital twin are the, I guess you could call it like the quantitative data from the force frame machine, but then also the consultation stuff from whoever the coach is, and if stuff is wrong in there, then the agent can catch the coach and say, you know, the evidence doesn't back this up.

Speaker 3  1:23
Yeah, or well, it's not going to do that there, right? Is it going to do? It could like be rape my coach. Was it rape my coach

Speaker 1  1:35
or rape

Speaker 3  1:35
my physio? Uh

Speaker 4  1:36
huh.

Speaker 3  1:37
Yeah. How do you you know compare your notes versus the goats? But is that depends

Speaker 1  1:43
who the buyer is there, right? Because if the buyer is the physio, and this is this is a piece of kit that the physio is giving out to users, they're not going to want the rate my coach type thing in there. So,

Speaker 3  1:59
so like, all right, so I'm trying. comes back from a year in the future and gives you the product done.

Speaker 1  2:05
Yeah.

Speaker 3  2:06
Who's it for?

Speaker 1  2:09
I think it's for. I think that the buyer is the physio or the coach, and they're basically passing the cost onto the user through however they're already charging for the services, and and I think it's a way of saying we're like a leading edge physio or gym or whatever. One of the like it's very competitive space. You come with us, look at the shiny thing that you're going to get, but it's going to help you like build your knowledge over time of how your body is working and how your body's recovering, and like capture the conversations that we have and the stuff I'm telling you is like stored there relative to all your actual like muscles and stuff. You know, so you can roll back and see previous injuries. You can see based on current injuries or tightness or imbalances what the recommended things are and stuff, and maybe yeah, it's a thing I always struggle with because then I'm like, well, of course you then have the plan of what exercises and stuff they need to do in here, and I just I don't know where we stop then, you know. Like, does the person can can they also then come in and while they're doing a live workout track what weights they're lifting and stuff? Do you know? It's like you need to stop somewhere.

Speaker 3  3:30
Well, do you? I mean, I think for a thing for a hackathon. Yeah, yeah, yeah, yeah. All right, cool.

Speaker 1  3:36
Like for for like a simple story that we tell up there and rebuild the thing that's working. Do you know?

Speaker 3  3:41
Yeah. Okay. So we want. All right. So I think this is how. I think it's done via stories. So it's like you've got. So you've got a feed, right? So you have events. Okay. Yeah. So it's like my hamstring injury, my training plan for let's say soccer, right, or basketball or golf. Yeah. Right. And then okay. Consider this one story. We also want to update the exercises week on week, and we. then also bought a golf trading story, which shows which which muscles Are used and need to be approved to do for our swing. Finally, we need a blended port. It shows how you can do. It shows your daily workout plan, taking into kids your past, injuries. This is yeah. This includes notes from physio slash results. right. All right. Okay. So we're gonna basically make a demo, right? So what I'm thinking is we have one more. We have have like an injury. We have an injury recovery plan, and we have a golf swing improvement, which has your muscle muscle improvement plan. Yeah, and we have a we got you to make like an image as well of like a person. Yeah, yeah. The interesting

Speaker 1  6:52
thing with golf is also a lot of it's about like the skill. I guess this applies across, but like the skeletal structure. So like if you've got, for example, a longer, like, longer legs and a shorter body, then it means that you probably need to bend over more. You know, it's like it's different setup for each person. So I didn't.

Speaker 2  7:17
Okay. Use the Atlas. image tool to create new selection for health improvements for costume improvements. It

Speaker 3  7:44
should show key changes needed to be made due to skeletal

Speaker 2  7:55
changes from the room and which muscles could be prevented by accessories. Do not permit current mouse framework. Story. But it uses the context of the engine.

Speaker 3  8:41
Okay. So this will have like,

Speaker 5  8:50
yeah.

Speaker 1  8:57
So should

Speaker 3  9:00
also have

Speaker 2  9:04
two dimensions of versus the oscillator and an image of their perfect. counseling with mock OCI slash Levin GOA overlaid.

Speaker 3  9:39
Okay, so it's gonna have like a mock golf story, and then we have the hamstring injury, which is like in the past, but it like reflects that it remembers that.

Speaker 1  9:50
What what I'm not quite following in here is where's the actual like real capability that we're building out for the demo, like an actual agent doing something, because this feels like a like solid prototype to go look at this like concept drawing. Yeah. But where where do you see the actual kind of agentic stuff coming in here?

Speaker 3  10:10
I guess doing one of these in real time as well.

Speaker 1  10:13
So I was I was thinking that I was thinking we could show something where the coach or the physio adds in.

Speaker 3  10:23
So you have that doc, right? Yeah.

Speaker 3  10:25
So do you want to have another one where, or I'll take that doc and I'll say convert this to show which muscles are used. Yeah.

Speaker 1  10:34
So that that that that's where that's where I think it's it's helpful. If and this is a whiteboard marker. If Stephen and work. If if Stephen, the physio, is dropped a voice note into the product, basically saying, "Okay, I had Kingsley in. He was. Well, you can play.

Speaker 3  10:56
No one knows any idea.

Speaker 1  10:57
Yeah.

Speaker 3  10:58
Just ask her to write you. Yeah, but

Speaker 1  10:59
if we could do that live, you know. Oh yeah, he's got like a a tightness in his shoulder. We'll get more physio language. Blah blah blah. The agent's job could then be to interpret that and then write the notes and assign the notes onto the different body parts and stuff. Yeah. So that the user is then able to see like the tagged notes against the actual like relevant parts of the body, yeah. Because that could that could then you can you could do an extraction from a whole transcript consultation, and basically the agent's job is to take that, decompose it, and map it against the actual the the actual body that we've got.

Speaker 3  11:41
Yeah, so we'll we'll add a thing up top, which is just like record a voice note. What time

Speaker 1  11:49
is it? Three. I think so. Yeah,

Speaker 3  11:52
we got it. Sorry, it's like okay. Are you like? I mean, we're demoing it. Let me check. Okay, we got some gun running right here. So it's gonna have like

Speaker 1  12:43
330.

Speaker 3  12:44
Just in business, like demos. Yeah. Yeah. Show which muscles to improve. How your personal. I guess there's

Speaker 1  12:57
there's two use cases for this. There's like the recovery

Speaker 2  13:00
one

Speaker 1  13:00
of or like the body score type thing, where it's like to use my example. I'm

Speaker 3  13:06
not given enough ways here. So what do you mean when you say body score? How do you want to see it visualized?

Speaker 1  13:11
What I'm talking about there is like if I go in and I find out that I've got a rotated hip and this goes over that way and all the rest, that might I might not necessarily be wanting to improve my golf swing, you know, or it might be a recovery thing. I could have injured like a rotator cuff, and I'm going to the physio because I want to improve the rotator cuff. Yeah, but it might not be relevant to a golf swing. So I guess what I what I was saying there is, it feels like there's two separate use cases here of which there would be overlapping features. One is the I don't know if you think about it as like recovery versus performance. You know, if they're the two different use cases.

Speaker 3  13:51
I think the two work together though. They do. Yeah. Right. Like, like I used to like lift weights, and it was like you'd be doing great, and then you'd like fuck yourself. Yeah, imagine it was like you're right back to the start. Yeah, and it'd be so interesting because I was going like, you know, based on your current, it's like yeah, you know, you have you shouldn't be doing X, Y, Z,

Speaker 1  14:11
or you keep like the the thing that kept happening to me was I I kept getting a like twinge in my shoulder there whenever I go back to the gym myself.

Speaker 2  14:18
Yeah,

Speaker 1  14:19
and ever since going into the more PT environment, I realized it's because I was like isolating whatever muscles too much, or I wasn't working other muscles which support it. But what had happened in like the two years leading up to that, I just had this recurring like niggle in my shoulder, and then the minute I started doing a proper program with the PT, it's like, oh, I can lift way heavier with that shoulder now, and I'm not getting the niggled, you know. So you could also spot things like yeah, recurring injuries in a place, and and

Speaker 3  14:48
yeah, because like also like like we're in a position where I'm hot PT, a lot of people just can't afford PT. So it's like yeah. I don't know if your physio could also be your PT,

Unknown Speaker  15:01
or can your PT be?

Transcribed by https://otter.ai
