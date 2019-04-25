const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');

// function ko(wrapped) {
//   return function() {
//     console.log("Starting");
//     const result = wrapped.apply(this, arguments);
//     console.log("Finished");
//     return result;
//   };
// }

// const qo.taskQueue = [];
// let doing = false;
  // static staticProperty = "babelIsCool";

class qo {
  static in(wrapped) {
    return async function(...args) {
      // console.log("Starting");
      
      let result; 
      if (!qo.doing) {
        console.log("not doing")
        qo.doing = true;
        try{
          result = await wrapped.apply(this, args);
        }
        catch (error) {
          console.log("resolver error:", error)
        }
        if (qo.taskQueue.length>0){
          const firstTask = qo.taskQueue[0];
          qo.taskQueue.shift();
          firstTask.start();
        } else {
          qo.doing = false;
        }
      } else {
        console.log("doing")
        const task = {
        }
        const promise = new Promise(function(resolve, reject) {
          task.start = resolve;
        })
        qo.taskQueue.push(task)
        await promise;
  
        try{
          result = await wrapped.apply(this, arguments);
        }
        catch (error) {
          console.log("resolver error:", error)
        }
        if (qo.taskQueue.length>0){
          const firstTask = qo.taskQueue[0];
          qo.taskQueue.shift();
          firstTask.start();
        } else {
          qo.doing = false;
        }      
      }
  
      // console.log("Finished");
      return result;
    };
  }
}
qo.doing = false;
qo.taskQueue = [];

// function ko(wrapped) {
//   return async function() {
//     // console.log("Starting");
    
//     let result; 
//     if (!doing) {
//       doing = true;
//       try{
//         result = await wrapped.apply(this, arguments);
//       }
//       catch (error) {
//         console.log("resolver error:", error)
//       }
//       if (qo.taskQueue.length>0){
//         const firstTask = qo.taskQueue[0];
//         qo.taskQueue.shift();
//         firstTask.start();
//       } else {
//         doing = false;
//       }
//     } else {
//       const task = {
//       }
//       const promise = new Promise(function(resolve, reject) {
//         task.start = resolve;
//       })
//       qo.taskQueue.push(task)
//       await promise;

//       try{
//         result = await wrapped.apply(this, arguments);
//       }
//       catch (error) {
//         console.log("resolver error:", error)
//       }
//       if (qo.taskQueue.length>0){
//         const firstTask = qo.taskQueue[0];
//         qo.taskQueue.shift();
//         firstTask.start();
//       } else {
//         doing = false;
//       }      
//     }

//     // console.log("Finished");
//     return result;
//   };
// }

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello(name: String): String
  }
`;

// const wrapped = ko(() => {
//   console.log("test22");
// });

// function a(){
//   console.log("a");
// }

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: qo.in(async (_,{name}) => {      
      console.log("1;", name);
      const a = new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('foo');
        }, 30*1000);
      });

      // return a;
      await a;
      console.log("2");
      return 'Hello world!'
    })
    // hello: () => {      
    //   // console.log("1");
    //   // const a = new Promise(function(resolve, reject) {
    //   //   setTimeout(function() {
    //   //     resolve('foo');
    //   //   }, 30*1000);
    //   // });

    //   // // return a;
    //   // await a;
    //   // // console.log("2");
    //   // return 'Hello world!'
    // }
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = new Koa();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);