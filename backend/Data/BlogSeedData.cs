using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class BlogSeedData
{
    public static async Task SeedAsync(IntexDbContext db)
    {
        if (await db.BlogPosts.AnyAsync())
        {
            return;
        }

        db.BlogPosts.AddRange(GetSeedPosts());
        await db.SaveChangesAsync();
    }

    private static List<BlogPost> GetSeedPosts() =>
    [
        new BlogPost
        {
            Title = "Thankful to Celebrate 5 Years",
            Data = "September 12, 2023  Jewelz  Uncategorized  No Comments",
            Categories = "Uncategorized",
            Comments = "No Comments",
            Text = @"It’s been 5 years since we opened the doors to Lighthouse Sanctuary here in the Philippines.  I remember receiving our license in August 2018 and thinking, “Oh I hope we can manage the flood of children who will be referred.”  August passed and no one was referred, September passed and no one was referred, October I cried most of the month and then started to question the work that we had put in for the 2 years prior.  By November I knew I needed to submit to His timing and His plan, even though I was not sure at that point what that plan was.

On Thanksgiving Day a sweet, 5 year old girl was referred.  She was scared and didn’t want to stay but her mother comforted her and let her know we were here to protect her until they could make their home a safe place.  The next day (still Thanksgiving Day in the US) an 11 year old girl was referred.  She spoke a foreign dialect to all, and was confused and angry.  That Thanksgiving weekend my heart was so full of gratitude to God for every aspect of my life!  I knew that these girls were His children and it was a privilege to be in a position of helping them.  Within 2 weeks there were two more children referred and I could see that Lighthouse Sanctuary was now in full swing.

The work was hard!!!  The first children were not sure they could trust us, since there weren’t any other children to assure them. I was so grateful for every moment the Lord had given me to prepare for this work.  I was tested in every way to see what an environment of verbal, physical and sexual abuse could do to an innocent child.

Six months after we received our first referral, our family was exhausted, stressed out and feeling that the weight was all on our shoulders. Our children were feeling the affects of the work and we didn’t know what to do.  As we prayed about it we received an answer to take our children and go back to Utah.  We accepted the answer, but then I started to struggle with self doubt and fear that I had failed.  When I would turn to the Lord I would have peace that it would all work out, but when I wondered what others would think, I felt awful.  How could I explain to our donors that we were leaving the shelter just months after starting it?  I knew our staff was capable and I knew God could provide but I only questioned what my role was and if I had anything to offer.

We got home in 2019 just before the school year started and I promised my kids a school year in Utah before returning to the Philippines, although I had no idea what the Lord’s plan really was.  Fast forward six months, the pandemic ended their school year and we were stuck in Utah for a full year longer.  Lighthouse Sanctuary was able to be a refuge during the pandemic and grew in strength and number as time went on.  It was another testament to me that Lighthouse is God’s and He is just allowing people the privilege to do the work.  It was also a testament to me that God knew what was coming and He knew what our family needed.

It was amazing to return back to the shelter after so long to see it full and thriving.  The children were trusting that God sent them there and they were learning and healing. The staff had remained strong and they were grateful to have a job through the pandemic.  They told us how they were so happy to be spiritually uplifted and refined through their work during such an unpredictable time.

More and more social workers and police officers were seeing the lives of the children change for the better after they were referred and they started spreading the word.  In these 5 years of operations, we have now served 100 children.  Most have returned back to their homes or a home of a safe family.  12 still continue to enjoy safety within the shelter as of today.  Some left with the skills of a great leader for their families and friends.  Others are still learning and growing, but all say they cannot deny the love they felt at Lighthouse.

That love is so real, so tangible that last year when Elder Bangerter (Area President for the Church of Jesus Christ of Latter Day Saints) was encouraged to drop by and see the work, he claimed that his “life was changed forever.”  He said the “spirit of love was poured over him like water.”  He could feel the Lord asking him to do something but he wasn’t sure what it was.  He took a video of the girls singing and asked if he could share it with Elder Renlund (an apostle of the Church of Jesus Christ of Latter Day Saints.)  He encouraged me to write a proposal letter to the LDS Charities for whatever we needed.

Our family knew then that it was time to expand the work.  We proposed that LDS Charities would fund a new shelter.  They not only agreed with our request but added more than we asked for.  We broke ground 3 months later and it was a sacred event.  That same love of God poured down like water over each of us.  The building was started right away and Elder Renlund, along with his wife and other church leaders came to visit and leave a powerful blessing for the future success of God’s work through Lighthouse Sanctuary.

Our family recently moved closer to the new shelter, (7 hours from the first) in order to hire, train and prepare it for children.  The building is estimated for completion and ready for occupancy before Thanksgiving Day of this year.  We are already feeling so thankful for the opportunity to see how God works through his disciples, imperfect and all, to create miracles that bless the lives of so many.  To God be the glory for the first 5 years of miracles for Lighthouse!  May His name be praised for every success, every step of progress, every ounce of hope added to this work and this world.

Happy 5th Anniversary to every donor who makes Lighthouse possible, to every child who benefitted and every staff member who served diligently!  May God’s love continue to pour over you."
        },
        new BlogPost
        {
            Title = "The Power of Light",
            Data = "December 11, 2024  Jewelz  Uncategorized  No Comments",
            Categories = "Uncategorized",
            Comments = "No Comments",
            Text = @"Survivor Journaling

I took a phone call recently that inspired this blog.  A potential donor called, eager to help the survivors at Lighthouse, and she declared boldly how she could “just kill the evil, disgusting men who were responsible for their abuse.”

Honestly I was saddened by her response!  Although I was grateful for her desire to help, I realized that she was only able to see a small glimpse into this work. I wanted to give her the privilege of seeing the beauty of what is happening in Lighthouse, but I wasn’t sure where to start.

It’s hard to talk about child sexual abuse without a lot of hard emotions.  It’s one of the darkest subjects that exists. Children need us to be passionate about it and moved by it so we will protect them, but the individual cases are never simple.

Many first abuse cases are perpetrated by a youth; a cousin, a sibling or a boyfriend. Usually the child being abused does not fully understand what is happening and all too often the abuser is acting out of curiosity or natural desire and has no intention of damaging the victim longterm.

Other children are generally abused by an adult they trusted most; a step father, father, uncle or leader.  Most of the time the adult showed love and kindness toward the child as well as the abusive behavior, so the child has both good and bad feeling toward the adult.

To make things even more complicated the abuse suffered by a child never just affects the child. There is usually a mother, a wife or others involved who are affected by the abuse, leaving the abused child feeling responsible for their reaction.  Even when we express the pain we feel for knowing of the abuse, the child often feels responsible for that too.

Teaching a child to only focus on the abuse and to hate the “evil, disgusting” abuser has been shown to be very damaging to the healing process of the child.

The shocking thing for me to witness in this work is the more anger and hatred the child holds onto from their abuse, the more that darkness controls them and they begin to act abusive in different ways, to those around them or even towards themselves.

Every year becomes more clear that true healing comes through the Atonement and teachings of Jesus Christ.  It comes in understanding that people are good, or they are lost but they are rarely evil. Children who have experienced the darkness of abuse need us to be a light for them to hold hope for better days and those who have abused also need our light to shine their way out of darkness. We cannot be filled with light if we show love to one by hating the other.  Light comes from being filled with love, peace, hope, mercy, patience and faithfulness.

In this work some people have been very angry at us because we support the survivors in filing a case against their abuser.  We believe that boundaries and justice can and should be implemented with that same light.  In supporting the child in their desire to file a case, our goal is not only to stop the abuse but to help the perpetrator find hope through taking accountability and committing to better choices.  We believe that justice done in light changes people and communities.

The most beautiful things I have seen in this work are repentance and forgiveness!  Men who have abused asking for forgiveness and being willing to take full accountability to the law and to God for their actions is beautiful!  Then seeing a survivor forgive, knowing that no action of the law will take away their suffering, but trusting that God will make it right in time, is life changing to witness!

Repentance and forgiveness are why the Savior came and why He was willing to suffer all He did for us.  When we turn to Him in repentance and choose to forgive we shine light into those dark places and bring the hope of the Lord in.  In this work the only enemy is darkness and the only weapon is light.

Thank you to all who have joined the fight by choosing to lay down your weapons of darkness (anger, hatred, jealousy, self-pity, shame) and take on the power of light (Peace, hope, joy, mercy, patience and faithfulness).  The world is brighter with your help and the work of Lighthouse is stronger because of you!"
        },
        new BlogPost
        {
            Title = "Highs and Lows of Lighthouse",
            Data = "May 11, 2025  Jewelz  Uncategorized  No Comments",
            Categories = "Uncategorized",
            Comments = "No Comments",
            Text = @"I’ve struggled to write a blog for some time because I so desperately want to encapsulate everything Lighthouse is—but that’s not possible. It’s a little bit of everything. As I re-entered its doors this month, I was reminded why it’s so hard to put into words what it’s like to be at Lighthouse.

Within moments of being there, a child I love ran up to me, hugged me, and thanked me for helping her find justice after six long years. She was excited and happy. I felt deep joy and gratitude for the existence of Lighthouse and the hope these children now have for justice. Shortly after that joyful moment, I learned there were death threats against her family because her perpetrators had been found guilty. I hurt for each of them!

Within the same hour, I was consoling another child in the shelter who had just found out her father had passed away. He was the only safe person in her life—the only family member she had hoped to reunite with after her court hearings finished. She went from feeling grateful for the years Lighthouse had protected and supported her, to wondering if life was hopeless.

Later that day, another child received a message saying she was to blame for the suicide of her perpetrator—only to later find out it was a manipulative lie. Still, the message was clear: she was being blamed for turning in her abuser. She cried and we cried with her.

I turned to the next child, who wanted to express how grateful she was because she was about to receive eye surgery—something she’d waited for her whole life. Though unrelated to her abuse, kind doctors from the hospital had been inspired by the work of Lighthouse and offered to help. She was overwhelmed with appreciation for those trying to make her life better and so were we.

As I approached the next child, I was so excited to see her growth over the last 6 months. She had gone from a fear-filled pregnant teen to a faith filled empowered mother. She still faced family trials and even court trials but her gratitude shown through!

This is just a glimpse into a few moments at the shelter. Currently, there are 15 children at Lighthouse. Each one has their own story—each with highs and lows. Each day, I witness tears of hopelessness, frustration, sadness, and fear for the future. And within that same day, I see these girls dance, laugh, and express gratitude for the good in their lives. There’s no easy way to express what Lighthouse is. It doesn’t magically take away every pain or trial, but it gives purpose, hope, and help to those facing what once felt impossible.

When I first felt the call to start a safe house for children, I was well aware it was a daunting task—and well aware that I wasn’t equipped to make it successful. But I’m so grateful for the gift of faith that moved me forward and allowed me to witness how God calls people who are equipped: whether through medical expertise, financial support, or simply being a shoulder to cry on. He has a way to ease pains and heal wounds and that way is generally through His disciples. Each of us has been given gifts that allow us to ease others burdens and in so doing we find more hope and healing in our own lives. Lighthouse is God’s work. It brings hope to the hopeless, healing to the afflicted, and help to the vulnerable. It is a work that requires many hands.

Thank you to everyone who continues to donate and volunteer. We need you! These children need Lighthouse! And Lighthouse is only possible through your continued support. Please keep giving. Please invite your friends to help. The children pray for you—and we pray that you receive the blessings you need as you sacrifice for what they need. From all of us at Lighthouse, we send our love—and thank you from the bottom of our hearts for your support."
        }
    ];
}
