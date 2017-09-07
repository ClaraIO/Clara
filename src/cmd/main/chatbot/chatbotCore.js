/**
 * @file a Chatbot using tensorflow. idk what else to say
 * @todo meme satania
 * @author Capuccino
 */
 const tf = require('tensorflow2');
 const bucket = require('./Bucket');
 const fs = require('fs');
 /**
  * A class the handles neural-based text responses
  */
 class Chatbot {
     /**
      * @param {String} dataPath path of where the data is
      * @param {String} convoFile the corpus file for convos
      * @param {String} lineFile the corpus file for lines
      * @param {String} outputFile  the output corpus file 
      * @param {String} processedPath the path on where to dump processed files for caching
      * @param {String} checkpoints path of where to place the checkpoints
      * @param {Number} treshold the treshold for collision
      * @param {Number} padID *
      * @param {Number} unkID *
      * @param {Number} startID * 
      * @param {Number} eosID *
      * @param {Number} testSetSize the size of the test sets
      */
     constructor(dataPath, convoFile, lineFile, outputFile, processedPath, checkpoints, treshold, padID, unkID, startID, eosID, testSetSize) {
         this.dataPath = dataPath,
         this.convoFile = convoFile,
         this.outputFile = outputFile,
         this.processedPath = processedPath,
         this.checkpoints = checkpoints,
         this.treshold = treshold,
         this.padID = padID,
         this.unkID = unkID,
         this.startID = startID,
         this.eosID = eosID,
         this.testSetSize = testSetSize || 25000;
         
         //typechecker for number-only properties
         if (isNaN(this.eodID, this.padID, this.treshold, this.unkID, this.startID, this.testSetSize)) return new TypeError('you have set a property that only allows number. Please amend.');
         // some checks again
         if (!fs.existsSync(this.dataPath)) throw new Error();
         if (!fs.existsSync(this.convoFile)) throw new Error();
         if (!fs.existsSync(this.outputFile)) fs.writeFileSync(this.outputFile);
         if (!fs.existsSync(this.lineFile)) throw new Error();
         if (!fs.existsSync(this.processedPath)) fs.mkdirSync(this.processedPath);
         if (!fs.existsSync(this.checkpoints)) fs.mkdirSync(this.checkpoints);
     }

     async getRandomBucket(trainBucketScale) {
         if (isNaN(trainBucketScale)) return new TypeError('trainBucketScale is not a number');
         let rand = Math.random();
         for (let i in trainBucketScale = i++) {
             return new bucket(trainBucketScale, 60000); // thonkang
         }
     }
 }

 module.exports = Chatbot;