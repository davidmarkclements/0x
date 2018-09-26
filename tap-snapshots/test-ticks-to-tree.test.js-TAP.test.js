/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/ticks-to-tree.test.js TAP ticksToTree - snapshot > crypto-ticks 1`] = `
{ merged:
   { name: 'all stacks',
     value: 20,
     top: 0,
     children:
      [ { S: 1,
          name: '(anonymous) [eval]:1:1',
          value: 1,
          top: 0,
          children:
           [ { S: 1,
               name: '(anonymous) [eval]:5:10',
               value: 1,
               top: 0,
               children:
                [ { S: 0,
                    name:
                     'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                    value: 1,
                    top: 0,
                    children: [ { S: 0, name: '_int_free [CPP]', value: 1, top: 1 } ] } ] } ] },
        { S: 1,
          name:
           'bootstrapNodeJSCore internal/bootstrap/node.js:15:30 [INIT]',
          value: 19,
          top: 0,
          children:
           [ { S: 0,
               name:
                'v8::internal::Runtime_CompileLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
               value: 1,
               top: 0,
               children:
                [ { S: 0,
                    name:
                     'v8::internal::FeedbackVector::New(v8::internal::Isolate*, v8::internal::Handle<v8::internal::SharedFunctionInfo>) [CPP]',
                    value: 1,
                    top: 1 } ] },
             { S: 1,
               name: 'startup internal/bootstrap/node.js:30:19 [INIT]',
               value: 18,
               top: 0,
               children:
                [ { S: 1,
                    name: 'setupProcessFatal internal/bootstrap/node.js:468:29 [INIT]',
                    value: 2,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 2,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 2,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: '(anonymous) internal/async_hooks.js:1:11 [INIT]',
                                   value: 2,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 2,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 2,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name: '(anonymous) internal/errors.js:1:11 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Builtin_NumberPrototypeToString(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       children: [ { S: 0, name: 'fmod [CPP]', value: 1, top: 1 } ] },
                                                     { S: 1,
                                                       name: 'E internal/errors.js:195:11',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name: 'makeSystemErrorWithCode internal/errors.js:146:33',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 0,
                                                                 name:
                                                                  'v8::internal::Runtime_DefineClass(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Factory::InitializeJSObjectFromMap(v8::internal::Handle<v8::internal::JSObject>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Map>) [CPP]',
                                                                      value: 1,
                                                                      top: 1 } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     'setupProcessICUVersions internal/bootstrap/node.js:523:35 [INIT]',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 0,
                         name:
                          'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 0,
                              name: 'std::locale::id::_M_id() const [CPP]',
                              value: 1,
                              top: 1 } ] } ] },
                  { S: 1,
                    name:
                     'setupGlobalVariables internal/bootstrap/node.js:336:32 [INIT]',
                    value: 4,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 4,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 4,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: '(anonymous) util.js:1:11 [INIT]',
                                   value: 4,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 3,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 3,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name: '(anonymous) internal/encoding.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name:
                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name: '(anonymous) internal/util.js:1:11 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_StoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::Factory::AllocateRawFixedArray(int, v8::internal::PretenureFlag) [CPP]',
                                                                           value: 1,
                                                                           top: 1 } ] } ] } ] } ] } ] },
                                                { S: 1,
                                                  name: '(anonymous) buffer.js:1:11 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name:
                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name: '(anonymous) internal/buffer.js:1:11 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_KeyedStoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::compiler::JumpThreading::ComputeForwarding(v8::internal::Zone*, v8::internal::ZoneVector<v8::internal::compiler::RpoNumber>&, v8::internal::compiler::InstructionSequence*, bool) [CPP]',
                                                                           value: 1,
                                                                           top: 1 } ] } ] } ] } ] },
                                                     { S: 0,
                                                       name:
                                                        'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 0, name: '__GI___mprotect [CPP]', value: 1, top: 1 } ] } ] } ] } ] },
                                      { S: 1,
                                        name: 'deprecate internal/util.js:43:19',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 0,
                                             name:
                                              'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 0,
                                                  name: 'v8::internal::FixedArray::Shrink(int) [CPP]',
                                                  value: 1,
                                                  top: 1 } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               '(anonymous) internal/process/main_thread_only.js:1:11 [INIT]',
                              value: 1,
                              top: 0,
                              children:
                               [ { S: 0,
                                   name:
                                    'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                   value: 1,
                                   top: 0,
                                   children:
                                    [ { S: 0,
                                        name:
                                         'v8::internal::FixedArray::set(int, v8::internal::Object*) [CPP]',
                                        value: 1,
                                        top: 1 } ] } ] } ] } ] },
                  { S: 1,
                    name: 'setupNextTick internal/process/next_tick.js:5:23 [INIT]',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 1,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: '(anonymous) internal/process/promises.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   children:
                                    [ { S: 0,
                                        name:
                                         'v8::internal::Runtime_DeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 0, name: '__GI___mprotect [CPP]', value: 1, top: 1 } ] } ] } ] } ] } ] },
                  { S: 1,
                    name: 'setupHrtime internal/process/per_thread.js:97:21',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 0,
                         name: 'TypedArrayConstructor [CODE:Builtin]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 0,
                              name:
                               'v8::internal::Builtin_ArrayBufferConstructor(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                              value: 1,
                              top: 0,
                              children: [ { S: 0, name: '__calloc [CPP]', value: 1, top: 1 } ] } ] } ] },
                  { S: 1,
                    name:
                     'setupGlobalTimeouts internal/bootstrap/node.js:385:31 [INIT]',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 1,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: '(anonymous) timers.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name: '(anonymous) internal/timers.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 0,
                                                            name:
                                                             'v8::internal::JSObject::DefineOwnPropertyIgnoreAttributes(v8::internal::LookupIterator*, v8::internal::Handle<v8::internal::Object>, v8::internal::PropertyAttributes, v8::internal::ShouldThrow, v8::internal::JSObject::AccessorInfoHandling) [CPP]',
                                                            value: 1,
                                                            top: 1 } ] } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     'setupGlobalConsole internal/bootstrap/node.js:395:30 [INIT]',
                    value: 3,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 3,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 3,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: '(anonymous) internal/modules/cjs/loader.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name: '(anonymous) internal/modules/cjs/helpers.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name: 'sort native array.js:610:46',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name: 'InnerArraySort native array.js:486:24',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name: 'QuickSort native array.js:530:19',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: 'QuickSort native array.js:530:19',
                                                                      value: 1,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 0, name: 'Inc [CODE:BytecodeHandler]', value: 1, top: 1 } ] } ] } ] } ] } ] } ] } ] } ] },
                                 { S: 1,
                                   name: '(anonymous) console.js:1:11 [INIT]',
                                   value: 2,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name: 'getStdout internal/process/stdio.js:18:21 [INIT]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'createWritableStdioStream internal/process/stdio.js:164:35 [INIT]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name:
                                                   'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name: '(anonymous) net.js:1:11 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name: 'debuglog util.js:310:18',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::IC::ShouldRecomputeHandler(v8::internal::Handle<v8::internal::String>) [CPP]',
                                                                           value: 1,
                                                                           top: 1 } ] } ] } ] } ] } ] } ] } ] },
                                      { S: 1,
                                        name: 'getStderr internal/process/stdio.js:33:21',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 0,
                                             name: 'LoadIC_Uninitialized [CODE:Builtin]',
                                             value: 1,
                                             top: 1 } ] } ] } ] } ] } ] },
                  { S: 1,
                    name: 'preloadModules internal/bootstrap/node.js:583:26 [INIT]',
                    value: 3,
                    top: 0,
                    children:
                     [ { S: 1,
                         name:
                          'Module._preloadModules internal/modules/cjs/loader.js:789:34 [INIT]',
                         value: 3,
                         top: 0,
                         children:
                          [ { S: 1,
                              name:
                               'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                              value: 3,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                   value: 3,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name: 'tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                                        value: 2,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name: 'Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                             value: 2,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name:
                                                   'Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        'Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                                       value: 2,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name: 'require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            value: 2,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name:
                                                                  'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 value: 2,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      value: 2,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 1,
                                                                           name:
                                                                            'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           value: 2,
                                                                           top: 0,
                                                                           children:
                                                                            [ { S: 1,
                                                                                name:
                                                                                 'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                value: 2,
                                                                                top: 0,
                                                                                children:
                                                                                 [ { S: 1,
                                                                                     name: '(anonymous) cluster.js:1:11 [INIT]',
                                                                                     value: 2,
                                                                                     top: 0,
                                                                                     children:
                                                                                      [ { S: 1,
                                                                                          name:
                                                                                           'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                          value: 2,
                                                                                          top: 0,
                                                                                          children:
                                                                                           [ { S: 1,
                                                                                               name:
                                                                                                'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                               value: 2,
                                                                                               top: 0,
                                                                                               children:
                                                                                                [ { S: 1,
                                                                                                    name: '(anonymous) internal/cluster/master.js:1:11 [INIT]',
                                                                                                    value: 2,
                                                                                                    top: 0,
                                                                                                    children:
                                                                                                     [ { S: 1,
                                                                                                         name:
                                                                                                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                         value: 2,
                                                                                                         top: 0,
                                                                                                         children:
                                                                                                          [ { S: 1,
                                                                                                              name:
                                                                                                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                              value: 2,
                                                                                                              top: 0,
                                                                                                              children:
                                                                                                               [ { S: 1,
                                                                                                                   name: '(anonymous) child_process.js:1:11 [INIT]',
                                                                                                                   value: 2,
                                                                                                                   top: 0,
                                                                                                                   children:
                                                                                                                    [ { S: 0,
                                                                                                                        name: 'LoadIC_Noninlined [CODE:Builtin]',
                                                                                                                        value: 1,
                                                                                                                        top: 1 },
                                                                                                                      { S: 1,
                                                                                                                        name:
                                                                                                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                        value: 1,
                                                                                                                        top: 0,
                                                                                                                        children:
                                                                                                                         [ { S: 1,
                                                                                                                             name:
                                                                                                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                             value: 1,
                                                                                                                             top: 0,
                                                                                                                             children:
                                                                                                                              [ { S: 1,
                                                                                                                                  name: '(anonymous) internal/child_process.js:1:11 [INIT]',
                                                                                                                                  value: 1,
                                                                                                                                  top: 0,
                                                                                                                                  children:
                                                                                                                                   [ { S: 1,
                                                                                                                                       name:
                                                                                                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                                       value: 1,
                                                                                                                                       top: 0,
                                                                                                                                       children:
                                                                                                                                        [ { S: 1,
                                                                                                                                            name:
                                                                                                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                                            value: 1,
                                                                                                                                            top: 0,
                                                                                                                                            children:
                                                                                                                                             [ { S: 0, name: 'StoreIC [CODE:Builtin]', value: 1, top: 1 } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] },
                                      { S: 1,
                                        name:
                                         'Module._resolveFilename internal/modules/cjs/loader.js:547:35 [INIT]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'Module._resolveLookupPaths internal/modules/cjs/loader.js:400:38 [INIT]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 0,
                                                  name:
                                                   'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Map::IsUnboxedDoubleField(v8::internal::FieldIndex) const [CPP]',
                                                       value: 1,
                                                       top: 1 } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     'Module.runMain internal/modules/cjs/loader.js:729:26 [INIT]',
                    value: 1,
                    top: 0,
                    children:
                     [ { S: 1,
                         name: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                         value: 1,
                         top: 0,
                         children:
                          [ { S: 1,
                              name: 'tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                              value: 1,
                              top: 0,
                              children:
                               [ { S: 1,
                                   name: 'Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                   value: 1,
                                   top: 0,
                                   children:
                                    [ { S: 1,
                                        name:
                                         'Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                        value: 1,
                                        top: 0,
                                        children:
                                         [ { S: 1,
                                             name:
                                              'Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                             value: 1,
                                             top: 0,
                                             children:
                                              [ { S: 1,
                                                  name: '(anonymous) /tmp/test.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  children:
                                                   [ { S: 1,
                                                       name: 'random /tmp/test.js:1:79 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       children:
                                                        [ { S: 1,
                                                            name: 'require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            children:
                                                             [ { S: 1,
                                                                 name:
                                                                  'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      children:
                                                                       [ { S: 1,
                                                                           name:
                                                                            'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           value: 1,
                                                                           top: 0,
                                                                           children:
                                                                            [ { S: 1,
                                                                                name:
                                                                                 'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                value: 1,
                                                                                top: 0,
                                                                                children:
                                                                                 [ { S: 1,
                                                                                     name: '(anonymous) crypto.js:1:11 [INIT]',
                                                                                     value: 1,
                                                                                     top: 0,
                                                                                     children:
                                                                                      [ { S: 1,
                                                                                          name: 'deprecate internal/util.js:43:19',
                                                                                          value: 1,
                                                                                          top: 0,
                                                                                          children:
                                                                                           [ { S: 0,
                                                                                               name:
                                                                                                'v8::internal::Builtin_ObjectSetPrototypeOf(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                                               value: 1,
                                                                                               top: 0,
                                                                                               children:
                                                                                                [ { S: 0,
                                                                                                    name:
                                                                                                     'v8::internal::Map::SetConstructor(v8::internal::Object*, v8::internal::WriteBarrierMode) [CPP]',
                                                                                                    value: 1,
                                                                                                    top: 1 } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] },
  unmerged:
   { name: 'all stacks',
     value: 20,
     top: 0,
     children:
      [ { S: 1,
          name: '~(anonymous) [eval]:1:1',
          value: 1,
          top: 0,
          fn: '(anonymous) [eval]:1:1',
          children:
           [ { S: 1,
               name: '~(anonymous) [eval]:5:10',
               value: 1,
               top: 0,
               fn: '(anonymous) [eval]:5:10',
               children:
                [ { S: 0,
                    name:
                     'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                    value: 1,
                    top: 0,
                    fn:
                     'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                    children:
                     [ { S: 0,
                         name: '_int_free [CPP]',
                         value: 1,
                         top: 1,
                         fn: '_int_free [CPP]' } ] } ] } ] },
        { S: 1,
          name:
           '~bootstrapNodeJSCore internal/bootstrap/node.js:15:30 [INIT]',
          value: 19,
          top: 0,
          isInit: true,
          fn:
           'bootstrapNodeJSCore internal/bootstrap/node.js:15:30 [INIT]',
          children:
           [ { S: 0,
               name:
                'v8::internal::Runtime_CompileLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
               value: 1,
               top: 0,
               fn:
                'v8::internal::Runtime_CompileLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
               children:
                [ { S: 0,
                    name:
                     'v8::internal::FeedbackVector::New(v8::internal::Isolate*, v8::internal::Handle<v8::internal::SharedFunctionInfo>) [CPP]',
                    value: 1,
                    top: 1,
                    fn:
                     'v8::internal::FeedbackVector::New(v8::internal::Isolate*, v8::internal::Handle<v8::internal::SharedFunctionInfo>) [CPP]' } ] },
             { S: 1,
               name: '~startup internal/bootstrap/node.js:30:19 [INIT]',
               value: 18,
               top: 0,
               isInit: true,
               fn: 'startup internal/bootstrap/node.js:30:19 [INIT]',
               children:
                [ { S: 1,
                    name:
                     '~setupProcessFatal internal/bootstrap/node.js:468:29 [INIT]',
                    value: 2,
                    top: 0,
                    isInit: true,
                    fn: 'setupProcessFatal internal/bootstrap/node.js:468:29 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 2,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 2,
                              top: 0,
                              isInit: true,
                              fn:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~(anonymous) internal/async_hooks.js:1:11 [INIT]',
                                   value: 2,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) internal/async_hooks.js:1:11 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 2,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 2,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name: '~(anonymous) internal/errors.js:1:11 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) internal/errors.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Builtin_NumberPrototypeToString(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       fn:
                                                        'v8::internal::Builtin_NumberPrototypeToString(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       children:
                                                        [ { S: 0, name: 'fmod [CPP]', value: 1, top: 1, fn: 'fmod [CPP]' } ] },
                                                     { S: 1,
                                                       name: '~E internal/errors.js:195:11',
                                                       value: 1,
                                                       top: 0,
                                                       fn: 'E internal/errors.js:195:11',
                                                       children:
                                                        [ { S: 1,
                                                            name: '~makeSystemErrorWithCode internal/errors.js:146:33',
                                                            value: 1,
                                                            top: 0,
                                                            fn: 'makeSystemErrorWithCode internal/errors.js:146:33',
                                                            children:
                                                             [ { S: 0,
                                                                 name:
                                                                  'v8::internal::Runtime_DefineClass(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 fn:
                                                                  'v8::internal::Runtime_DefineClass(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Factory::InitializeJSObjectFromMap(v8::internal::Handle<v8::internal::JSObject>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Map>) [CPP]',
                                                                      value: 1,
                                                                      top: 1,
                                                                      fn:
                                                                       'v8::internal::Factory::InitializeJSObjectFromMap(v8::internal::Handle<v8::internal::JSObject>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Map>) [CPP]' } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     '~setupProcessICUVersions internal/bootstrap/node.js:523:35 [INIT]',
                    value: 1,
                    top: 0,
                    isInit: true,
                    fn:
                     'setupProcessICUVersions internal/bootstrap/node.js:523:35 [INIT]',
                    children:
                     [ { S: 0,
                         name:
                          'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                         value: 1,
                         top: 0,
                         fn:
                          'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                         children:
                          [ { S: 0,
                              name: 'std::locale::id::_M_id() const [CPP]',
                              value: 1,
                              top: 1,
                              fn: 'std::locale::id::_M_id() const [CPP]' } ] } ] },
                  { S: 1,
                    name:
                     '~setupGlobalVariables internal/bootstrap/node.js:336:32 [INIT]',
                    value: 4,
                    top: 0,
                    isInit: true,
                    fn:
                     'setupGlobalVariables internal/bootstrap/node.js:336:32 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 4,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 4,
                              top: 0,
                              isInit: true,
                              fn:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~(anonymous) util.js:1:11 [INIT]',
                                   value: 4,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) util.js:1:11 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 3,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 3,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name: '~(anonymous) internal/encoding.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) internal/encoding.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       isInit: true,
                                                       fn:
                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       children:
                                                        [ { S: 1,
                                                            name:
                                                             '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            isInit: true,
                                                            fn:
                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            children:
                                                             [ { S: 1,
                                                                 name: '~(anonymous) internal/util.js:1:11 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 isInit: true,
                                                                 fn: '(anonymous) internal/util.js:1:11 [INIT]',
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_StoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      fn:
                                                                       'v8::internal::Runtime_StoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::Factory::AllocateRawFixedArray(int, v8::internal::PretenureFlag) [CPP]',
                                                                           value: 1,
                                                                           top: 1,
                                                                           fn:
                                                                            'v8::internal::Factory::AllocateRawFixedArray(int, v8::internal::PretenureFlag) [CPP]' } ] } ] } ] } ] } ] },
                                                { S: 1,
                                                  name: '~(anonymous) buffer.js:1:11 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) buffer.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       isInit: true,
                                                       fn:
                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                       children:
                                                        [ { S: 1,
                                                            name:
                                                             '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            isInit: true,
                                                            fn:
                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                            children:
                                                             [ { S: 1,
                                                                 name: '~(anonymous) internal/buffer.js:1:11 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 isInit: true,
                                                                 fn: '(anonymous) internal/buffer.js:1:11 [INIT]',
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_KeyedStoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      fn:
                                                                       'v8::internal::Runtime_KeyedStoreIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::compiler::JumpThreading::ComputeForwarding(v8::internal::Zone*, v8::internal::ZoneVector<v8::internal::compiler::RpoNumber>&, v8::internal::compiler::InstructionSequence*, bool) [CPP]',
                                                                           value: 1,
                                                                           top: 1,
                                                                           fn:
                                                                            'v8::internal::compiler::JumpThreading::ComputeForwarding(v8::internal::Zone*, v8::internal::ZoneVector<v8::internal::compiler::RpoNumber>&, v8::internal::compiler::InstructionSequence*, bool) [CPP]' } ] } ] } ] } ] },
                                                     { S: 0,
                                                       name:
                                                        'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       fn:
                                                        'v8::internal::Runtime_InterpreterDeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       children:
                                                        [ { S: 0,
                                                            name: '__GI___mprotect [CPP]',
                                                            value: 1,
                                                            top: 1,
                                                            fn: '__GI___mprotect [CPP]' } ] } ] } ] } ] },
                                      { S: 1,
                                        name: '~deprecate internal/util.js:43:19',
                                        value: 1,
                                        top: 0,
                                        fn: 'deprecate internal/util.js:43:19',
                                        children:
                                         [ { S: 0,
                                             name:
                                              'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                             value: 1,
                                             top: 0,
                                             fn:
                                              'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                             children:
                                              [ { S: 0,
                                                  name: 'v8::internal::FixedArray::Shrink(int) [CPP]',
                                                  value: 1,
                                                  top: 1,
                                                  fn: 'v8::internal::FixedArray::Shrink(int) [CPP]' } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                    value: 1,
                    top: 0,
                    isInit: true,
                    fn:
                     'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                         value: 1,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~(anonymous) internal/process/main_thread_only.js:1:11 [INIT]',
                              value: 1,
                              top: 0,
                              isInit: true,
                              fn:
                               '(anonymous) internal/process/main_thread_only.js:1:11 [INIT]',
                              children:
                               [ { S: 0,
                                   name:
                                    'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                   value: 1,
                                   top: 0,
                                   fn:
                                    'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                   children:
                                    [ { S: 0,
                                        name:
                                         'v8::internal::FixedArray::set(int, v8::internal::Object*) [CPP]',
                                        value: 1,
                                        top: 1,
                                        fn:
                                         'v8::internal::FixedArray::set(int, v8::internal::Object*) [CPP]' } ] } ] } ] } ] },
                  { S: 1,
                    name: '~setupNextTick internal/process/next_tick.js:5:23 [INIT]',
                    value: 1,
                    top: 0,
                    isInit: true,
                    fn: 'setupNextTick internal/process/next_tick.js:5:23 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 1,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 1,
                              top: 0,
                              isInit: true,
                              fn:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~(anonymous) internal/process/promises.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) internal/process/promises.js:1:11 [INIT]',
                                   children:
                                    [ { S: 0,
                                        name:
                                         'v8::internal::Runtime_DeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                        value: 1,
                                        top: 0,
                                        fn:
                                         'v8::internal::Runtime_DeserializeLazy(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                        children:
                                         [ { S: 0,
                                             name: '__GI___mprotect [CPP]',
                                             value: 1,
                                             top: 1,
                                             fn: '__GI___mprotect [CPP]' } ] } ] } ] } ] } ] },
                  { S: 1,
                    name: '~setupHrtime internal/process/per_thread.js:97:21',
                    value: 1,
                    top: 0,
                    fn: 'setupHrtime internal/process/per_thread.js:97:21',
                    children:
                     [ { S: 0,
                         name: 'TypedArrayConstructor [CODE:Builtin]',
                         value: 1,
                         top: 0,
                         fn: 'TypedArrayConstructor [CODE:Builtin]',
                         children:
                          [ { S: 0,
                              name:
                               'v8::internal::Builtin_ArrayBufferConstructor(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                              value: 1,
                              top: 0,
                              fn:
                               'v8::internal::Builtin_ArrayBufferConstructor(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                              children:
                               [ { S: 0,
                                   name: '__calloc [CPP]',
                                   value: 1,
                                   top: 1,
                                   fn: '__calloc [CPP]' } ] } ] } ] },
                  { S: 1,
                    name:
                     '~setupGlobalTimeouts internal/bootstrap/node.js:385:31 [INIT]',
                    value: 1,
                    top: 0,
                    isInit: true,
                    fn:
                     'setupGlobalTimeouts internal/bootstrap/node.js:385:31 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 1,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 1,
                              top: 0,
                              isInit: true,
                              fn:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~(anonymous) timers.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) timers.js:1:11 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 1,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 1,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name: '~(anonymous) internal/timers.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) internal/timers.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       value: 1,
                                                       top: 0,
                                                       fn:
                                                        'v8::internal::Runtime_CreateObjectLiteral(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                       children:
                                                        [ { S: 0,
                                                            name:
                                                             'v8::internal::JSObject::DefineOwnPropertyIgnoreAttributes(v8::internal::LookupIterator*, v8::internal::Handle<v8::internal::Object>, v8::internal::PropertyAttributes, v8::internal::ShouldThrow, v8::internal::JSObject::AccessorInfoHandling) [CPP]',
                                                            value: 1,
                                                            top: 1,
                                                            fn:
                                                             'v8::internal::JSObject::DefineOwnPropertyIgnoreAttributes(v8::internal::LookupIterator*, v8::internal::Handle<v8::internal::Object>, v8::internal::PropertyAttributes, v8::internal::ShouldThrow, v8::internal::JSObject::AccessorInfoHandling) [CPP]' } ] } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     '~setupGlobalConsole internal/bootstrap/node.js:395:30 [INIT]',
                    value: 3,
                    top: 0,
                    isInit: true,
                    fn:
                     'setupGlobalConsole internal/bootstrap/node.js:395:30 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         value: 3,
                         top: 0,
                         isInit: true,
                         fn:
                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              value: 3,
                              top: 0,
                              isInit: true,
                              fn:
                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~(anonymous) internal/modules/cjs/loader.js:1:11 [INIT]',
                                   value: 1,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) internal/modules/cjs/loader.js:1:11 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        value: 1,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             value: 1,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name: '~(anonymous) internal/modules/cjs/helpers.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) internal/modules/cjs/helpers.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name: '~sort native array.js:610:46',
                                                       value: 1,
                                                       top: 0,
                                                       fn: 'sort native array.js:610:46',
                                                       children:
                                                        [ { S: 1,
                                                            name: '~InnerArraySort native array.js:486:24',
                                                            value: 1,
                                                            top: 0,
                                                            fn: 'InnerArraySort native array.js:486:24',
                                                            children:
                                                             [ { S: 1,
                                                                 name: '~QuickSort native array.js:530:19',
                                                                 value: 1,
                                                                 top: 0,
                                                                 fn: 'QuickSort native array.js:530:19',
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: '~QuickSort native array.js:530:19',
                                                                      value: 1,
                                                                      top: 0,
                                                                      fn: 'QuickSort native array.js:530:19',
                                                                      children:
                                                                       [ { S: 0,
                                                                           name: 'Inc [CODE:BytecodeHandler]',
                                                                           value: 1,
                                                                           top: 1,
                                                                           fn: 'Inc [CODE:BytecodeHandler]' } ] } ] } ] } ] } ] } ] } ] } ] },
                                 { S: 1,
                                   name: '~(anonymous) console.js:1:11 [INIT]',
                                   value: 2,
                                   top: 0,
                                   isInit: true,
                                   fn: '(anonymous) console.js:1:11 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name: '~getStdout internal/process/stdio.js:18:21 [INIT]',
                                        value: 1,
                                        top: 0,
                                        isInit: true,
                                        fn: 'getStdout internal/process/stdio.js:18:21 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~createWritableStdioStream internal/process/stdio.js:164:35 [INIT]',
                                             value: 1,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'createWritableStdioStream internal/process/stdio.js:164:35 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name:
                                                   '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  isInit: true,
                                                  fn:
                                                   'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       isInit: true,
                                                       fn:
                                                        'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                       children:
                                                        [ { S: 1,
                                                            name: '~(anonymous) net.js:1:11 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            isInit: true,
                                                            fn: '(anonymous) net.js:1:11 [INIT]',
                                                            children:
                                                             [ { S: 1,
                                                                 name: '~debuglog util.js:310:18',
                                                                 value: 1,
                                                                 top: 0,
                                                                 fn: 'debuglog util.js:310:18',
                                                                 children:
                                                                  [ { S: 0,
                                                                      name:
                                                                       'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      fn:
                                                                       'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                      children:
                                                                       [ { S: 0,
                                                                           name:
                                                                            'v8::internal::IC::ShouldRecomputeHandler(v8::internal::Handle<v8::internal::String>) [CPP]',
                                                                           value: 1,
                                                                           top: 1,
                                                                           fn:
                                                                            'v8::internal::IC::ShouldRecomputeHandler(v8::internal::Handle<v8::internal::String>) [CPP]' } ] } ] } ] } ] } ] } ] } ] },
                                      { S: 1,
                                        name: '~getStderr internal/process/stdio.js:33:21',
                                        value: 1,
                                        top: 0,
                                        fn: 'getStderr internal/process/stdio.js:33:21',
                                        children:
                                         [ { S: 0,
                                             name: 'LoadIC_Uninitialized [CODE:Builtin]',
                                             value: 1,
                                             top: 1,
                                             fn: 'LoadIC_Uninitialized [CODE:Builtin]' } ] } ] } ] } ] } ] },
                  { S: 1,
                    name: '~preloadModules internal/bootstrap/node.js:583:26 [INIT]',
                    value: 3,
                    top: 0,
                    isInit: true,
                    fn: 'preloadModules internal/bootstrap/node.js:583:26 [INIT]',
                    children:
                     [ { S: 1,
                         name:
                          '~Module._preloadModules internal/modules/cjs/loader.js:789:34 [INIT]',
                         value: 3,
                         top: 0,
                         isInit: true,
                         fn:
                          'Module._preloadModules internal/modules/cjs/loader.js:789:34 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                              value: 3,
                              top: 0,
                              isInit: true,
                              fn:
                               'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                   value: 3,
                                   top: 0,
                                   isInit: true,
                                   fn: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                                        value: 2,
                                        top: 0,
                                        isInit: true,
                                        fn: 'tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name: '~Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                             value: 2,
                                             top: 0,
                                             isInit: true,
                                             fn: 'Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name:
                                                   '~Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                                  value: 2,
                                                  top: 0,
                                                  isInit: true,
                                                  fn:
                                                   'Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name:
                                                        '~Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                                       value: 2,
                                                       top: 0,
                                                       isInit: true,
                                                       fn:
                                                        'Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                                       children:
                                                        [ { S: 1,
                                                            name: '~require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            value: 2,
                                                            top: 0,
                                                            isInit: true,
                                                            fn: 'require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            children:
                                                             [ { S: 1,
                                                                 name:
                                                                  '~Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 value: 2,
                                                                 top: 0,
                                                                 isInit: true,
                                                                 fn:
                                                                  'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: '~Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      value: 2,
                                                                      top: 0,
                                                                      isInit: true,
                                                                      fn: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      children:
                                                                       [ { S: 1,
                                                                           name:
                                                                            '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           value: 2,
                                                                           top: 0,
                                                                           isInit: true,
                                                                           fn:
                                                                            'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           children:
                                                                            [ { S: 1,
                                                                                name:
                                                                                 '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                value: 2,
                                                                                top: 0,
                                                                                isInit: true,
                                                                                fn:
                                                                                 'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                children:
                                                                                 [ { S: 1,
                                                                                     name: '~(anonymous) cluster.js:1:11 [INIT]',
                                                                                     value: 2,
                                                                                     top: 0,
                                                                                     isInit: true,
                                                                                     fn: '(anonymous) cluster.js:1:11 [INIT]',
                                                                                     children:
                                                                                      [ { S: 1,
                                                                                          name:
                                                                                           '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                          value: 2,
                                                                                          top: 0,
                                                                                          isInit: true,
                                                                                          fn:
                                                                                           'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                          children:
                                                                                           [ { S: 1,
                                                                                               name:
                                                                                                '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                               value: 2,
                                                                                               top: 0,
                                                                                               isInit: true,
                                                                                               fn:
                                                                                                'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                               children:
                                                                                                [ { S: 1,
                                                                                                    name: '~(anonymous) internal/cluster/master.js:1:11 [INIT]',
                                                                                                    value: 2,
                                                                                                    top: 0,
                                                                                                    isInit: true,
                                                                                                    fn: '(anonymous) internal/cluster/master.js:1:11 [INIT]',
                                                                                                    children:
                                                                                                     [ { S: 1,
                                                                                                         name:
                                                                                                          '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                         value: 2,
                                                                                                         top: 0,
                                                                                                         isInit: true,
                                                                                                         fn:
                                                                                                          'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                         children:
                                                                                                          [ { S: 1,
                                                                                                              name:
                                                                                                               '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                              value: 2,
                                                                                                              top: 0,
                                                                                                              isInit: true,
                                                                                                              fn:
                                                                                                               'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                              children:
                                                                                                               [ { S: 1,
                                                                                                                   name: '~(anonymous) child_process.js:1:11 [INIT]',
                                                                                                                   value: 2,
                                                                                                                   top: 0,
                                                                                                                   isInit: true,
                                                                                                                   fn: '(anonymous) child_process.js:1:11 [INIT]',
                                                                                                                   children:
                                                                                                                    [ { S: 0,
                                                                                                                        name: 'LoadIC_Noninlined [CODE:Builtin]',
                                                                                                                        value: 1,
                                                                                                                        top: 1,
                                                                                                                        fn: 'LoadIC_Noninlined [CODE:Builtin]' },
                                                                                                                      { S: 1,
                                                                                                                        name:
                                                                                                                         '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                        value: 1,
                                                                                                                        top: 0,
                                                                                                                        isInit: true,
                                                                                                                        fn:
                                                                                                                         'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                        children:
                                                                                                                         [ { S: 1,
                                                                                                                             name:
                                                                                                                              '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                             value: 1,
                                                                                                                             top: 0,
                                                                                                                             isInit: true,
                                                                                                                             fn:
                                                                                                                              'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                             children:
                                                                                                                              [ { S: 1,
                                                                                                                                  name: '~(anonymous) internal/child_process.js:1:11 [INIT]',
                                                                                                                                  value: 1,
                                                                                                                                  top: 0,
                                                                                                                                  isInit: true,
                                                                                                                                  fn: '(anonymous) internal/child_process.js:1:11 [INIT]',
                                                                                                                                  children:
                                                                                                                                   [ { S: 1,
                                                                                                                                       name:
                                                                                                                                        '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                                       value: 1,
                                                                                                                                       top: 0,
                                                                                                                                       isInit: true,
                                                                                                                                       fn:
                                                                                                                                        'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                                                                                       children:
                                                                                                                                        [ { S: 1,
                                                                                                                                            name:
                                                                                                                                             '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                                            value: 1,
                                                                                                                                            top: 0,
                                                                                                                                            isInit: true,
                                                                                                                                            fn:
                                                                                                                                             'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                                                                            children:
                                                                                                                                             [ { S: 0,
                                                                                                                                                 name: 'StoreIC [CODE:Builtin]',
                                                                                                                                                 value: 1,
                                                                                                                                                 top: 1,
                                                                                                                                                 fn: 'StoreIC [CODE:Builtin]' } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] },
                                      { S: 1,
                                        name:
                                         '~Module._resolveFilename internal/modules/cjs/loader.js:547:35 [INIT]',
                                        value: 1,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'Module._resolveFilename internal/modules/cjs/loader.js:547:35 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~Module._resolveLookupPaths internal/modules/cjs/loader.js:400:38 [INIT]',
                                             value: 1,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'Module._resolveLookupPaths internal/modules/cjs/loader.js:400:38 [INIT]',
                                             children:
                                              [ { S: 0,
                                                  name:
                                                   'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                  value: 1,
                                                  top: 0,
                                                  fn:
                                                   'v8::internal::Runtime_LoadIC_Miss(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                  children:
                                                   [ { S: 0,
                                                       name:
                                                        'v8::internal::Map::IsUnboxedDoubleField(v8::internal::FieldIndex) const [CPP]',
                                                       value: 1,
                                                       top: 1,
                                                       fn:
                                                        'v8::internal::Map::IsUnboxedDoubleField(v8::internal::FieldIndex) const [CPP]' } ] } ] } ] } ] } ] } ] } ] },
                  { S: 1,
                    name:
                     '~Module.runMain internal/modules/cjs/loader.js:729:26 [INIT]',
                    value: 1,
                    top: 0,
                    isInit: true,
                    fn:
                     'Module.runMain internal/modules/cjs/loader.js:729:26 [INIT]',
                    children:
                     [ { S: 1,
                         name: '~Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                         value: 1,
                         top: 0,
                         isInit: true,
                         fn: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                         children:
                          [ { S: 1,
                              name:
                               '~tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                              value: 1,
                              top: 0,
                              isInit: true,
                              fn: 'tryModuleLoad internal/modules/cjs/loader.js:535:23 [INIT]',
                              children:
                               [ { S: 1,
                                   name: '~Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                   value: 1,
                                   top: 0,
                                   isInit: true,
                                   fn: 'Module.load internal/modules/cjs/loader.js:590:33 [INIT]',
                                   children:
                                    [ { S: 1,
                                        name:
                                         '~Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                        value: 1,
                                        top: 0,
                                        isInit: true,
                                        fn:
                                         'Module._extensions..js internal/modules/cjs/loader.js:698:37 [INIT]',
                                        children:
                                         [ { S: 1,
                                             name:
                                              '~Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                             value: 1,
                                             top: 0,
                                             isInit: true,
                                             fn:
                                              'Module._compile internal/modules/cjs/loader.js:650:37 [INIT]',
                                             children:
                                              [ { S: 1,
                                                  name: '~(anonymous) /tmp/test.js:1:11 [INIT]',
                                                  value: 1,
                                                  top: 0,
                                                  isInit: true,
                                                  fn: '(anonymous) /tmp/test.js:1:11 [INIT]',
                                                  children:
                                                   [ { S: 1,
                                                       name: '~random /tmp/test.js:1:79 [INIT]',
                                                       value: 1,
                                                       top: 0,
                                                       isInit: true,
                                                       fn: 'random /tmp/test.js:1:79 [INIT]',
                                                       children:
                                                        [ { S: 1,
                                                            name: '~require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            value: 1,
                                                            top: 0,
                                                            isInit: true,
                                                            fn: 'require internal/modules/cjs/helpers.js:17:19 [INIT]',
                                                            children:
                                                             [ { S: 1,
                                                                 name:
                                                                  '~Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 value: 1,
                                                                 top: 0,
                                                                 isInit: true,
                                                                 fn:
                                                                  'Module.require internal/modules/cjs/loader.js:629:36 [INIT]',
                                                                 children:
                                                                  [ { S: 1,
                                                                      name: '~Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      value: 1,
                                                                      top: 0,
                                                                      isInit: true,
                                                                      fn: 'Module._load internal/modules/cjs/loader.js:502:24 [INIT]',
                                                                      children:
                                                                       [ { S: 1,
                                                                           name:
                                                                            '~NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           value: 1,
                                                                           top: 0,
                                                                           isInit: true,
                                                                           fn:
                                                                            'NativeModule.require internal/bootstrap/loaders.js:140:34 [INIT]',
                                                                           children:
                                                                            [ { S: 1,
                                                                                name:
                                                                                 '~NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                value: 1,
                                                                                top: 0,
                                                                                isInit: true,
                                                                                fn:
                                                                                 'NativeModule.compile internal/bootstrap/loaders.js:236:44 [INIT]',
                                                                                children:
                                                                                 [ { S: 1,
                                                                                     name: '~(anonymous) crypto.js:1:11 [INIT]',
                                                                                     value: 1,
                                                                                     top: 0,
                                                                                     isInit: true,
                                                                                     fn: '(anonymous) crypto.js:1:11 [INIT]',
                                                                                     children:
                                                                                      [ { S: 1,
                                                                                          name: '~deprecate internal/util.js:43:19',
                                                                                          value: 1,
                                                                                          top: 0,
                                                                                          fn: 'deprecate internal/util.js:43:19',
                                                                                          children:
                                                                                           [ { S: 0,
                                                                                               name:
                                                                                                'v8::internal::Builtin_ObjectSetPrototypeOf(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                                               value: 1,
                                                                                               top: 0,
                                                                                               fn:
                                                                                                'v8::internal::Builtin_ObjectSetPrototypeOf(int, v8::internal::Object**, v8::internal::Isolate*) [CPP]',
                                                                                               children:
                                                                                                [ { S: 0,
                                                                                                    name:
                                                                                                     'v8::internal::Map::SetConstructor(v8::internal::Object*, v8::internal::WriteBarrierMode) [CPP]',
                                                                                                    value: 1,
                                                                                                    top: 1,
                                                                                                    fn:
                                                                                                     'v8::internal::Map::SetConstructor(v8::internal::Object*, v8::internal::WriteBarrierMode) [CPP]' } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } ] } }
`
